import GameService from '../service/game-service';
import GameListService from '../service/game-list-service';
import ScenarioService from '../service/scenario-service';

import { extractUserFromRequest } from './common';

const getScenarios = {
  method: 'GET',
  path: '/scenarios',
  async handler() {
    return ScenarioService.getScenarios();
  },
};

const addScenario = {
  method: 'POST',
  path: '/scenarios',
  async handler(request) {
    return ScenarioService.addScenario(
      extractUserFromRequest(request),
      request.payload,
    );
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
  async handler(request) {
    return GameListService.addGame(
      extractUserFromRequest(request),
      request.payload,
    );
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
    await GameService.deleteGame(extractUserFromRequest(request),
    request.params);
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
    return GameListService.getGames();
  },
};

const connectToGame = {
  method: 'POST',
  path: '/games/{gameId}',
  async handler(request) {
    return GameService.connectToGame(extractUserFromRequest(request), {
      ...request.payload,
      ...request.params,
    });
  },
  options: {
    validate: {
      //payload: GameValidator.addGame,
    },
  },
};

const setCompanyName = {
  method: 'POST',
  path: '/games/{gameId}/company',
  async handler(request, h) {
    await GameService.setCompanyName(extractUserFromRequest(request), {
      ...request.payload,
      ...request.params,
    });
    return h.response();
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
    await GameService.disconnectFromGame(extractUserFromRequest(request), {
      ...request.params,
    });
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
    await GameService.sendChatMessage(
      extractUserFromRequest(request),
      request.payload,
    );
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
    await GameService.sendChatMessage(extractUserFromRequest(request), {
      ...request.payload,
      ...request.params,
    });
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
    await GameService.setPlayerSolutions(extractUserFromRequest(request), {
      ...request.payload,
      ...request.params,
    });
    return h.response();
  },
  options: {
    validate: {
      //payload: GameValidator.addGame,
    },
  },
};

const restartGame = {
  method: 'POST',
  path: '/games/{gameId}/restart',
  async handler(request) {
    return GameListService.restartGame(extractUserFromRequest(request), {
      ...request.params,
    });
  },
  options: {
    validate: {
      //payload: GameValidator.addGame,
    },
  },
};

const rejectRestartGame = {
  method: 'DELETE',
  path: '/games/{gameId}/restart',
  async handler(request, h) {
    await GameListService.rejectRestartGame(extractUserFromRequest(request), {
      ...request.params,
    });
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
  setCompanyName,
  disconnectFromGame,
  sendChatMessageToGeneral,
  sendChatMessageToGame,
  setPlayerSolutions,
  restartGame,
  rejectRestartGame,
];
