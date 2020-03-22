import { getCustomRepository, getManager, getRepository, Repository } from "typeorm";
import * as Boom from '@hapi/boom';

import { Scenario } from "../entity/game/Scenario";
import { User } from "../entity/user/User";
import { Game } from "../entity/game/Game";
import { Player } from "../entity/player/Player";
import { GameState } from "../entity/game/GameState";
import { PlayerState } from "../entity/player/PlayerState";

import { PlayerRepository } from "../repository/player-repository";
import { GameRepository } from "../repository/game-repository";

import ScenarioMapper from '../mapper/scenario-mapper';
import GameMapper from '../mapper/game-mapper';
import GameHandler from './game';
import PlayerHandler from './player';
import UserService from './user-service';
import MessageSender from './game-message-sender-service';
import { server } from '../index';
import { ERRORS } from "../utils/errors";

const getScenarios = async () => {
  return (await getRepository(Scenario).find())
    .map((scenario) => ScenarioMapper.map(scenario));
};

const addScenario = async (user: User, payload) => {
  const scenarioRepository: Repository<Scenario> = getRepository(Scenario);

  if (await scenarioRepository.findOne({ where: { name: payload.name } })) {
    throw Boom.badRequest(ERRORS.SCENARIO.EXISTED);
  }

  const scenario: Scenario = new Scenario(payload);
  await scenarioRepository.save(scenario);
  return ScenarioMapper.map(scenario);
};

const addGame = async (payload) => {
  const scenarioRepository: Repository<Scenario> = getRepository(Scenario);

  const scenarioName = payload.scenario || process.env.DEFAULT_SCENARIO;
  const scenario: Scenario = await scenarioRepository.findOne({ where: { name: scenarioName } });
  if (!scenario) {
    throw Boom.badRequest(ERRORS.SCENARIO.INVALID);
  }
  payload.startCountDownTime = Date.now();
  payload.scenario = scenario;

  const newGame: Game = await GameHandler.addGame(payload);
  MessageSender.broadcastAddGameEvent(newGame);
};

const deleteGame = async (user: User, { gameId }) => {
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

const getGames = async () => {
  return (await getCustomRepository(GameRepository).findWithoutPeriods())
    .map((game) => GameMapper.mapPreview(game));
};

const connectToGame = async (user: User, { gameId, password, companyName }, request) => {
  return await getManager().transaction(async em => {
    const gameRepository = em.getCustomRepository(GameRepository);
    const playerRepository = em.getCustomRepository(PlayerRepository);

    const game = await gameRepository.findOneFull(gameId);
    if (!game) {
      throw Boom.badRequest(ERRORS.GAME.INVALID);
    }

    let player: Player = await playerRepository.findOneFullByUserName(user.userName);
    if (player) {
      if (!game.players.some((playerInGame) => playerInGame.userName === player.userName)) {
        throw Boom.badRequest(ERRORS.GAME.ALREADY_PLAYING);
      }
      player.timeToEndReload = 0;
      MessageSender.broadcastPlayerReconnected(game, player, game.currentPeriod - 1);
      MessageSender.sendPlayerUpdate(game, player, game.currentPeriod - 1);
    } else {
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

      if (game.players.some((player) => player.companyName === companyName)) {
        throw Boom.badRequest(ERRORS.GAME.COMPANY_EXISTED);
      }
      player = await PlayerHandler.addPlayer(user, game, companyName, em);
      game.players = game.players || [];
      game.players.push(player);
      await gameRepository.save(game);
      MessageSender.broadcastUpdateGameEvent(game);
      MessageSender.broadcastPlayerConnected(game, player, game.currentPeriod);
      MessageSender.sendPlayerUpdate(game, player, game.currentPeriod);

      request.logger.info(`Player ${player.userName}[${player.id}]: connected to ${game.name}[${game.id}]`);
    }
    return GameMapper.mapFull(game, game.currentPeriod);
  });
};

const checkUserInGame = async ({ gameId, userName }): Promise<boolean> => {
  const game = await getCustomRepository(GameRepository).findOneWithoutPeriods(gameId);
  return game && game.players.some((player) => player.userName === userName);
};

const leftFromGame = async ({ userName, isForce }) => {
  const player = await getCustomRepository(PlayerRepository).findOneFullByUserName(userName);
  if(!player) {
    return;
  }
  const game: Game = await getCustomRepository(GameRepository).findOneWithoutPeriods(player.game.id);
  if(!game) {
    return;
  }

  await PlayerHandler.handlePlayerDisconnect(game, player, isForce);
  MessageSender.broadcastPlayerDisconnected(game, player, game.currentPeriod);
  MessageSender.broadcastUpdateGameEvent(game);
  server.logger().info(`Player ${player.userName}: disconnected from ${game.name}[${game.id}] force: ${isForce}`);
};

const sendChatMessage = async (user: User, { message, gameId }) => {
  const chatMessage = {
    message,
    time: Date.now(),
    player: {
      id: user.id,
      userName: user.userName,
      avatar: user.avatar,
    },
  };

  if (gameId) {
    const game = await getRepository(Game).findOne(gameId);
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

  const player: Player = await playerRepository.findOneFullByUserName(user.userName);
  if (!player) {
    throw Boom.badRequest(ERRORS.GAME.NOT_PLAYING);
  }

  const game: Game = player.game;
  if (player.state !== PlayerState.THINK || !game.isSendSolutionsAllowed || player.isBankrupt) {
    throw Boom.badRequest(ERRORS.GAME.SOLUTIONS);
  }

  await PlayerHandler.setPlayerSolutions(game, player, solutions);
  game.playersSolutionsAmount++;
  MessageSender.broadcastPlayerUpdated(game, player, game.currentPeriod);
  request.logger.info(`Player ${player.userName}[${player.id}]: sends solutions. [bankrupt: ${player.isBankrupt}]`, solutions);

  const bankruptAmount = game.players.filter((player) => player.isBankrupt).length;
  if (game.playersSolutionsAmount + bankruptAmount >= game.players.length) {
    await GameHandler.handleNewPeriod(game, Date.now());
  }
};

const isGameNeedToBeRemoved = (game: Game, currentTime: number) =>
  game.players.length === 0
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
  getScenarios,
  addScenario,
  addGame,
  deleteGame,
  getGames,
  connectToGame,
  checkUserInGame,
  sendChatMessage,
  setPlayerSolutions,
  leftFromGame,
  updateGames,
}
