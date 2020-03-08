import GameService from '../service/game-service';
import GameValidator from './validator/game-validator';
import {extractUserFromRequest} from "./common";

const getScenarios = {
  method: 'GET',
  path: '/scenarios',
  async handler() {
    return GameService.getScenarios();
  }
};

const addScenario = {
  method: 'POST',
  path: '/scenarios',
  async handler(request) {
    return GameService.addScenario(extractUserFromRequest(request), request.payload);
  },
  options: {
    validate: {
      payload: GameValidator.addScenario,
    },
  },
};

const addGame = {
  method: 'POST',
  path: '/games',
  async handler(request, h) {
    await GameService.addGame(request.payload);
    h.response();
  },
  options: {
    validate: {
      payload: GameValidator.addGame,
    },
  },
};

const deleteGame = {
  method: 'DELETE',
  path: '/games/{gameId}',
  async handler(request, h) {
    await GameService.deleteGame(extractUserFromRequest(request), request.params);
    h.response();
  },
  options: {
    validate: {
      params: GameValidator.deleteGame,
    },
  },
};

const getGames = {
  method: 'GET',
  path: '/games',
  async handler() {
    return GameService.getGames();
  },
};


export default [
  getScenarios,
  addScenario,
  addGame,
  deleteGame,
  getGames,
];
