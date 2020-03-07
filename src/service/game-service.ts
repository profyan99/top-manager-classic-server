import {getCustomRepository, getRepository, Repository} from "typeorm";
import * as Boom from '@hapi/boom';

import {Scenario} from "../entity/game/Scenario";
import {User} from "../entity/user/User";
import {Game} from "../entity/game/Game";
import {GameRepository} from "../repository/game-repository";
import UserService from './user-service';

import ScenarioMapper from '../mapper/scenario-mapper';

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
  const scenario: Scenario = await scenarioRepository.findOne({ where: { name: scenarioName }});

  const game: Game = new Game({ ...payload, scenario });
  await gameRepository.save(game);
};

const deleteGame = async (user: User, { gameId }) => {
  const gameRepository: Repository<Game> = getRepository(Game);
  if(!UserService.isAdmin(user)) {
    throw Boom.badRequest('You don\'t have permissions to do that action');
  }

  const game: Game = await gameRepository.findOne({ where: { id: gameId } });
  if(!game) {
    throw Boom.badRequest('Invalid game id');
  }

  await gameRepository.remove(game);
};

const getGames = async () => {
  return (await getCustomRepository(GameRepository).findWithoutPeriods()).map((game) => ({
    id: game.id,
    name: game.name,
    maxPlayers: game.maxPlayers,
    maxPeriods: game.maxPeriods,
    currentPlayers: game.players.length,
    locked: !!game.password,
    tournament: game.tournament,
    scenario: ScenarioMapper.map(game.scenario),
    state: game.state,
    currentPeriod: game.currentPeriod,
  }))
};

export default {
  getScenarios,
  addScenario,
  addGame,
  deleteGame,
  getGames,
}
