import { getCustomRepository, getManager, getRepository } from 'typeorm';
import * as Boom from '@hapi/boom';

import { User } from '../entity/user/User';
import { Game } from '../entity/game/Game';
import { Player } from '../entity/player/Player';
import { GameState } from '../entity/game/GameState';
import { PlayerState } from '../entity/player/PlayerState';

import { PlayerRepository } from '../repository/player-repository';
import { GameRepository } from '../repository/game-repository';

import GameMapper from '../mapper/game-mapper';
import GameHandler from './game';
import * as PlayerHandler from './player';
import UserService from './user-service';
import MessageSender from './game-message-sender-service';
import { ERRORS } from '../utils/errors';
import PlayerMapper from '../mapper/player-mapper';
import mapUser from '../mapper/user-mapper';
import logger from '../logging';

const connectToGame = async (user: User, { gameId, password }, request) => {
  return await getManager().transaction(async em => {
    const gameRepository = em.getCustomRepository(GameRepository);
    const playerRepository = em.getCustomRepository(PlayerRepository);

    const game = await gameRepository.findOneFull(gameId);
    if (!game) {
      throw Boom.badRequest(ERRORS.GAME.INVALID);
    }

    let player: Player = await playerRepository.findOneFullByUserNameAndGame(user.userName, gameId);
    if (player && player.companyName) {
      if (!game.players.some((playerInGame) => playerInGame.userName === player.userName)) {
        throw Boom.badRequest(ERRORS.GAME.ALREADY_PLAYING);
      }
      player.timeToEndReload = 0;
      player.isConnected = true;
      await playerRepository.save(player);
      MessageSender.broadcastPlayerReconnected(game, player, game.currentPeriod - 1);
      logger.info(`Player ${player.userName}[${player.id}]: reconnected to ${game.name}[${game.id}]`);
    } else if(!player) {
      if (game.state === GameState.PLAY) {
        throw Boom.badRequest(ERRORS.GAME.STARTED);
      }

      if (game.state === GameState.END) {
        throw Boom.badRequest(ERRORS.GAME.ENDED);
      }

      if (game.players.length === game.maxPlayers) {
        throw Boom.badRequest(ERRORS.GAME.FULL);
      }

      if (game.password && password !== game.password) {
        throw Boom.badRequest(ERRORS.GAME.INVALID_PASSWORD);
      }

      player = await PlayerHandler.addPlayer(user, game, '', em);
      game.players = game.players || [];
      game.players.push(player);
      await gameRepository.save(game);
      logger.info(`Player ${player.userName}[${player.id}]: connected to ${game.name}[${game.id}]`);
    } else {
      logger.info(`Player ${player.userName}[${player.id}]: connected to ${game.name}[${game.id}] without userName`);
    }
    return {
      game: GameMapper.mapFull(game, game.currentPeriod),
      player: PlayerMapper.mapFullByPeriod(player, Math.max(game.currentPeriod - 1, 0)),
    };
  });
};

const setCompanyName = async (user: User, { gameId, companyName }) => {
  const gameRepository = getCustomRepository(GameRepository);
  const playerRepository = getCustomRepository(PlayerRepository);

  const game = await gameRepository.findOneWithoutPeriods(gameId);
  if(!game) {
    throw Boom.badRequest(ERRORS.GAME.INVALID);
  }

  const player: Player = await playerRepository.findOneFullByUserNameAndGame(user.userName, gameId);
  if(!player) {
    throw Boom.badRequest(ERRORS.GAME.INVALID_GAME_PLAYER_ASSOCIATION);
  }

  if (player.companyName.length) {
    throw Boom.badRequest(ERRORS.GAME.COMPANY_NAME_ALREADY_SET);
  }

  if (game.players.some((player) => player.companyName === companyName)) {
    throw Boom.badRequest(ERRORS.GAME.COMPANY_EXISTED);
  }

  player.companyName = companyName;
  player.isConnected = true;
  await playerRepository.save(player);

  MessageSender.broadcastUpdateGameEvent(game);
  MessageSender.broadcastPlayerConnected(game, player, game.currentPeriod);
  MessageSender.sendPlayerUpdate(game, player, 0);
  logger.info(`Player ${player.userName}[${player.id}]: complete connecting to ${game.name}[${game.id}] with ${companyName} company name`);
};

const connectToGameViaWebsocket = async ({ gameId, userName }): Promise<boolean> => {
  const game = await getCustomRepository(GameRepository).findOneWithoutPeriods(gameId);
  return game && game.players.some((player) => player.userName === userName);
};

const disconnectFromGame = async (user: User, { gameId }): Promise<void> => {
  await getManager().transaction(async em => {
    const playerRepository = em.getCustomRepository(PlayerRepository);

    const player = await playerRepository.findOneWithoutPeriods(user.userName, gameId);
    if (!player || player.game.id != gameId) {
      throw Boom.badRequest(ERRORS.GAME.INVALID_GAME_PLAYER_ASSOCIATION);
    }

    player.isConnected = false;
    if (player.game.state === GameState.PLAY) {
      await UserService.addPlayerLeaveGame(player.user, em);
    }
    await playerRepository.save(player);
  });
};

const disconnectFromGameViaWebsocket = async ({ userName, gameId }) => {
  const player = await getCustomRepository(PlayerRepository).findOneFullByUserNameAndGame(userName, gameId);
  if (!player) {
    return;
  }

  const game: Game = await getCustomRepository(GameRepository).findOneWithoutPeriods(player.game.id);
  if (!game) {
    return;
  }

  await PlayerHandler.removePlayer(game, player);

  MessageSender.broadcastPlayerDisconnected(game, player, game.currentPeriod);
  MessageSender.broadcastUpdateGameEvent(game);
  logger.info(`Player ${player.userName}: disconnected from ${game.name}[${game.id}] reload: ${player.timeToEndReload}`);
};

const sendChatMessage = async (user: User, { message, gameId }) => {
  const chatMessage = {
    message,
    time: Date.now(),
    player: mapUser(user),
  };

  if (gameId) {
    const game = await getCustomRepository(GameRepository).findOneWithoutPeriods(gameId);
    if (!game) {
      throw Boom.badRequest(ERRORS.GAME.INVALID);
    }

    MessageSender.broadcastMessageToGameChat(game, chatMessage);
  } else {
    MessageSender.broadcastMessageToGeneralChat(chatMessage);
  }
};

const setPlayerSolutions = async (user: User, solutions, request) => {
  const playerRepository = getCustomRepository(PlayerRepository);
  const gameRepository = getCustomRepository(GameRepository);

  const player: Player = await playerRepository.findOneFullByUserNameAndGame(user.userName, solutions.gameId);
  if (!player) {
    throw Boom.badRequest(ERRORS.GAME.NOT_PLAYING);
  }

  const game: Game = await gameRepository.findOneWithoutPeriods(player.game.id);
  if (player.state !== PlayerState.THINK || !game.isSendSolutionsAllowed || player.isBankrupt) {
    throw Boom.badRequest(ERRORS.GAME.SOLUTIONS);
  }

  await PlayerHandler.setPlayerSolutions(game, player, solutions);
  game.playersSolutionsAmount++;
  await gameRepository.save(game);

  MessageSender.broadcastPlayerUpdated(game, player, game.currentPeriod - 1);
  logger.info(`Player ${player.userName}[${player.id}]: sends solutions. [bankrupt: ${player.isBankrupt}]`, solutions);
};

const isGameNeedToBeRemoved = (game: Game, currentTime: number): boolean =>
  game.getConnectedPlayers().length === 0
  && (game.state !== GameState.PREPARE || (currentTime - game.startCountDownTime) / 1000 >= game.periodDuration);

export const updateGames = async () => {
  const allGames: Game[] = await getCustomRepository(GameRepository).findWithPlayers();
  const currentTime = Date.now();

  for (const game of allGames) {
    if (isGameNeedToBeRemoved(game, currentTime)) {
      await GameHandler.removeGame(game);
    } else {
      await GameHandler.updateGame(game, currentTime);
    }
  }
};

export default {
  connectToGame,
  setCompanyName,
  disconnectFromGame,
  connectToGameViaWebsocket,
  sendChatMessage,
  setPlayerSolutions,
  disconnectFromGameViaWebsocket,
  updateGames,
};
