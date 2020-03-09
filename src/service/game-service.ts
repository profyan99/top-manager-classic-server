import {getCustomRepository, getManager, getRepository, Repository} from "typeorm";
import * as Boom from '@hapi/boom';

import {Scenario} from "../entity/game/Scenario";
import {User} from "../entity/user/User";
import {Game} from "../entity/game/Game";
import {GameRepository} from "../repository/game-repository";
import UserService from './user-service';
import {
  broadcastAddGameEvent,
  broadcastPlayerReconnected,
  broadcastRemoveGameEvent,
  broadcastUpdateGameEvent,
  broadcastPlayerConnected,
  sendPlayerUpdate,
} from './game-message-sender-service';

import ScenarioMapper from '../mapper/scenario-mapper';
import GameMapper from '../mapper/game-mapper';
import {Player} from "../entity/player/Player";
import {GameState} from "../entity/game/GameState";
import addPlayer from "./player/player-add";
import {PlayerRepository} from "../repository/player-repository";

const getScenarios = async () => {
  return (await getRepository(Scenario).find())
    .map((scenario) => ScenarioMapper.map(scenario));
};

const addScenario = async (user: User, payload) => {
  const scenarioRepository: Repository<Scenario> = getRepository(Scenario);

  if (await scenarioRepository.findOne({where: {name: payload.name}})) {
    throw Boom.badRequest('Scenario with that name has already existed');
  }

  const scenario: Scenario = new Scenario(payload);
  await scenarioRepository.save(scenario);
  return ScenarioMapper.map(scenario);
};

const addGame = async (payload) => {
  const scenarioRepository: Repository<Scenario> = getRepository(Scenario);
  const gameRepository = getCustomRepository(GameRepository);

  const scenarioName = payload.scenario || process.env.DEFAULT_SCENARIO;
  const scenario: Scenario = await scenarioRepository.findOne({where: {name: scenarioName}});
  if(!scenario) {
    throw Boom.badRequest('Invalid scenario');
  }

  const game: Game = new Game({...payload, scenario});
  await gameRepository.save(game);
  broadcastAddGameEvent(game);
};

const deleteGame = async (user: User, {gameId}) => {
  const gameRepository: Repository<Game> = getRepository(Game);
  if (!UserService.isAdmin(user)) {
    throw Boom.badRequest('You don\'t have permissions to do that action');
  }

  const game: Game = await gameRepository.findOne(gameId);
  if (!game) {
    throw Boom.badRequest('Invalid game id');
  }

  await gameRepository.remove(game);
  broadcastRemoveGameEvent(game);
};

const getGames = async () => {
  return (await getCustomRepository(GameRepository).findWithoutPeriods())
    .map((game) => GameMapper.mapPreview(game));
};

const connectToGame = async (user: User, {gameId, password, companyName}) => {
  return await getManager().transaction(async em => {
    const gameRepository = em.getCustomRepository(GameRepository);
    const playerRepository = em.getCustomRepository(PlayerRepository);

    const game = await gameRepository.findOneWithoutPeriods(gameId);
    if (!game) {
      throw Boom.badRequest('Invalid game id');
    }

    let player: Player = await playerRepository.findOneFullByUserName(user.userName);
    if (player) {
      if (!game.players.some((playerInGame) => playerInGame.userName === player.userName)) {
        throw Boom.badRequest('You have already playing in another game');
      }
      player.timeToEndReload = 0;
      broadcastPlayerReconnected(game, player);
      sendPlayerUpdate(game, player);
    } else {
      if (game.players.length === game.maxPlayers) {
        throw Boom.badRequest('In game there are no free slots');
      }

      if (game.state === GameState.PLAY) {
        throw Boom.badRequest('Game has already started');
      }

      if (game.password && password !== game.password) {
        throw Boom.badRequest('Invalid game password');
      }

      if (game.players.some((player) => player.companyName === companyName)) {
        throw Boom.badRequest('Company with this name has already registered');
      }
      player = await addPlayer(user, game, companyName, em);
      game.players = game.players || [];
      game.players.push(player);
      await gameRepository.save(game);
      broadcastUpdateGameEvent(game);
      broadcastPlayerConnected(game, player);
    }
    return GameMapper.mapFull(game);
  });
};

const checkUserInGame = async ({gameId, userName}) => {
  const game = await getCustomRepository(GameRepository).findOneWithoutPeriods(gameId);
  return game && game.players.some((player) => player.userName === userName);
};

export default {
  getScenarios,
  addScenario,
  addGame,
  deleteGame,
  getGames,
  connectToGame,
  checkUserInGame,
}
