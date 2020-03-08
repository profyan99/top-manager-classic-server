import {getCustomRepository, getRepository, Repository} from "typeorm";
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

const getScenarios = () => {
  return getRepository(Scenario).find();
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
  const gameRepository = getCustomRepository(GameRepository);
  const playerRepository = getRepository(Player);

  const game = await gameRepository.findOneWithoutPeriods(gameId);
  if (!game) {
    throw Boom.badRequest('Invalid game id');
  }

  let player: Player = await playerRepository.findOne({where: {userName: user.userName}});
  if (player) {
    if (!game.players.some((player) => player.userName === player.userName)) {
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
    player = await addPlayer(user, game, companyName);
    game.players.push(player);
    await gameRepository.save(game);
    broadcastUpdateGameEvent(game);
    broadcastPlayerConnected(game, player);
  }
  return GameMapper.mapPreview(game);
};

const checkUserInGame = async ({gameId, userName}) => {
  const game = await getCustomRepository(GameRepository).findOneWithoutPeriods(gameId);
  return !(!game || !game.players.some((player) => player.userName === userName));

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
