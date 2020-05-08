import { getCustomRepository, getManager, getRepository, Repository } from 'typeorm';
import * as Boom from '@hapi/boom';

import GameHandler from './game';
import MessageSender, { broadcastGamesMetaDataUpdateEvent } from './game-message-sender-service';
import { GameRepository } from '../repository/game-repository';
import UserService from './user-service';
import GameMapper from '../mapper/game-mapper';
import { server } from '../index';

import { Scenario } from '../entity/game/Scenario';
import { ERRORS } from '../utils/errors';
import { Game } from '../entity/game/Game';
import { User } from '../entity/user/User';
import { GameState } from '../entity/game/GameState';
import * as PlayerHandler from './player';
import handlePlayerRemove from './player/player-remove';
import { Player } from '../entity/player/Player';
import { PlayerRepository } from '../repository/player-repository';

let onlineUsers = [];

export const addGame = async (user: User, payload) => {
  const scenarioRepository: Repository<Scenario> = getRepository(Scenario);

  const scenarioName = payload.scenario || process.env.DEFAULT_SCENARIO;
  const scenario: Scenario = await scenarioRepository.findOne({ where: { name: scenarioName } });
  if (!scenario) {
    throw Boom.badRequest(ERRORS.SCENARIO.INVALID);
  }
  payload.scenario = scenario;
  payload.owner = user;

  const newGame: Game = await GameHandler.addGame(payload);
  MessageSender.broadcastAddGameEvent(newGame);
};

export const deleteGame = async (user: User, { gameId }) => {
  const gameRepository = getCustomRepository(GameRepository);
  if (!UserService.isAdmin(user)) {
    throw Boom.badRequest(ERRORS.ADMIN.PERMISSIONS);
  }

  const game: Game = await gameRepository.findOne(gameId);
  if (!game) {
    throw Boom.badRequest(ERRORS.GAME.INVALID);
  }

  await GameHandler.removeGame(game);
  MessageSender.broadcastRemoveGameEvent(game);
};

export const getGames = async () => {
  return (await getCustomRepository(GameRepository).findWithoutPeriods())
    .map((game) => GameMapper.mapPreview(game));
};

export const onUserConnected = async (user: User) => {
  await UserService.setUserOnline(user, true);
  onlineUsers.push(user);
  broadcastGamesMetaDataUpdateEvent({ playersAmount: onlineUsers.length });
  server.logger().info(`User ${user.userName} connected via websocket`);
};

export const onUserDisconnected = async (user: User) => {
  await UserService.setUserOnline(user, false);
  onlineUsers = onlineUsers.filter((onlineUser) => onlineUser.id !== user.id);
  broadcastGamesMetaDataUpdateEvent({ playersAmount: onlineUsers.length });
  server.logger().info(`User ${user.userName} disconnected via websocket`);
};

export const restartGame = async (user: User, { gameId }) => {
  return await getManager().transaction(async em => {
    const gameRepository = em.getCustomRepository(GameRepository);
    const game = await gameRepository.findOneWithoutPeriods(gameId);

    if (game.owner.id !== user.id) {
      throw Boom.badRequest(ERRORS.GAME.NOT_OWNER);
    }

    if (game.state !== GameState.END) {
      throw Boom.badRequest(ERRORS.GAME.RESTART_NOT_ALLOWED);
    }
    const newGameProps = {
      ...game,
      id: null,
      state: GameState.PREPARE,
      players: null,
      periods: null,
      isSendSolutionsAllowed: false,
      playersSolutionsAmount: 0,
      isRemoved: false,
    };
    const newGame: Game = await GameHandler.addGame(newGameProps);
    const playersAddQueries = game.players.map((player) =>
      PlayerHandler.addPlayer(player.user, newGame, '', em)
    );

    newGame.players = await Promise.all(playersAddQueries);
    await gameRepository.save(newGame);

    const newGamePayload = {
      id: newGame.id,
    };

    MessageSender.broadcastRestartGameEvent(game, newGamePayload);
    MessageSender.broadcastAddGameEvent(newGame);
    server.logger().info(`User ${user.userName} attempt to restart ${game.name}[${game.id}] with new id - ${newGame.id}`);
    return newGame.id;
  });
};

export const rejectRestartGame = async (user: User, { gameId }) => {
  const gameRepository = getCustomRepository(GameRepository);
  const game = await gameRepository.findOneWithoutPeriods(gameId);

  if(!game) {
    throw Boom.badRequest(ERRORS.GAME.INVALID);
  }

  const player: Player = await getCustomRepository(PlayerRepository)
    .findOneFullByUserNameAndGame(user.userName, gameId);
  if(!player || player.game.id !== game.id) {
    throw Boom.badRequest(ERRORS.GAME.INVALID_GAME_PLAYER_ASSOCIATION);
  }

  await handlePlayerRemove(game, player);
  MessageSender.broadcastRejectRestartGameEvent(game, player);
  MessageSender.broadcastUpdateGameEvent(game);
  server.logger().info(`User ${user.userName} rejects restart ${game.name}[${game.id}]`);
};

export default {
  addGame,
  deleteGame,
  getGames,
  onUserConnected,
  onUserDisconnected,
  restartGame,
  rejectRestartGame,
};
