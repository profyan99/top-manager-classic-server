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
      //payload: GameValidator.addScenario,
    },
  },
};

const addGame = {
  method: 'POST',
  path: '/games',
  async handler(request, h) {
    await GameService.addGame(request.payload);
    return h.response();
  },
  options: {
    validate: {
      //payload: GameValidator.addGame,
    },
  },
};

/*const deleteGame = { //TODO another route for admins
  method: 'DELETE',
  path: '/games/{gameId}',
  async handler(request, h) {
    await GameService.deleteGame(extractUserFromRequest(request), request.params);
    return h.response();
  },
  options: {
    validate: {
      //params: GameValidator.deleteGame,
    },
  },
};*/

const getGames = {
  method: 'GET',
  path: '/games',
  async handler() {
    return GameService.getGames();
  },
};

const connectToGame = {
  method: 'POST',
  path: '/games/{gameId}',
  async handler(request) {
    return GameService.connectToGame(extractUserFromRequest(request), { ...request.payload, ...request.params }, request);
  },
  options: {
    validate: {
      //payload: GameValidator.addGame,
    },
  },
};

const disconnectFromGame = {
  method: 'DELETE',
  path: '/games/{gameId}',
  async handler(request, h) {
    await GameService.disconnectFromGame(extractUserFromRequest(request), { ...request.params });
    return h.response();
  },
  options: {
    validate: {
      //payload: GameValidator.addGame,
    },
  },
};

const sendChatMessageToGeneral = {
  method: 'POST',
  path: '/games/messages',
  async handler(request, h) {
    await GameService.sendChatMessage(extractUserFromRequest(request), request.payload);
    return h.response();
  },
  options: {
    validate: {
      //payload: GameValidator.addGame,
    },
  },
};

const sendChatMessageToGame = {
  method: 'POST',
  path: '/games/{gameId}/messages',
  async handler(request, h) {
    await GameService.sendChatMessage(extractUserFromRequest(request), { ...request.payload, ...request.params });
    return h.response();
  },
  options: {
    validate: {
      //payload: GameValidator.addGame,
    },
  },
};

const setPlayerSolutions = {
  method: 'POST',
  path: '/games/{gameId}/solutions',
  async handler(request, h) {
    await GameService.setPlayerSolutions(extractUserFromRequest(request), { ...request.payload }, request);
    return h.response();
  },
  options: {
    validate: {
      //payload: GameValidator.addGame,
    },
  },
};

export default [
  getScenarios,
  addScenario,
  addGame,
  getGames,
  connectToGame,
  disconnectFromGame,
  sendChatMessageToGeneral,
  sendChatMessageToGame,
  setPlayerSolutions,
];
