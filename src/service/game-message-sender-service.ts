import {Game} from "../entity/game/Game";
import WebsocketService from './websocket-service';
import GameMapper from '../mapper/game-mapper';
import PlayerMapper from '../mapper/player-mapper';
import {Player} from "../entity/player/Player";

const getGamePath = (game: Game): string => `${process.env.GAME_LIST_ROUTE}/${game.id}`;

const broadcastGamePreviewEvent = (game: Game, eventType: string) => {
  WebsocketService.publish(process.env.GAME_LIST_ROUTE, {
    objectType: 'GAME_PREVIEW',
    eventType: eventType,
    body: GameMapper.mapPreview(game),
  });
};

const broadcastPlayerEvent = (game: Game, player: Player, eventType: string) => {
  WebsocketService.publish(getGamePath(game), {
    objectType: 'PLAYER',
    eventType: eventType,
    body: PlayerMapper.mapPreview(player),
  });
};

const broadcastGameEvent = (game: Game, eventType: string, body) => {
  WebsocketService.publish(getGamePath(game), {
    objectType: 'GAME',
    eventType,
    body,
  });
};

const broadcastMessage = (path: string, message) => {
  WebsocketService.publish(path, {
    objectType: 'MESSAGE',
    eventType: 'ADD',
    body: message,
  });
};

export const broadcastAddGameEvent = (game: Game) => {
  broadcastGamePreviewEvent(game, 'ADD');
};

export const broadcastRemoveGameEvent = (game: Game) => {
  broadcastGamePreviewEvent(game, 'REMOVE');
  broadcastGameEvent(game, 'REMOVE', {});
};

export const broadcastUpdateGameEvent = (game: Game) => {
  broadcastGamePreviewEvent(game, 'UPDATE');
};

export const broadcastPlayerReconnected = (game: Game, player: Player) => {
  broadcastPlayerEvent(game, player, 'RECONNECT');
};

export const broadcastPlayerConnected = (game: Game, player: Player) => {
  broadcastPlayerEvent(game, player, 'CONNECT');
};

export const broadcastPlayerUpdated = (game: Game, player: Player) => {
  broadcastPlayerEvent(game, player, 'UPDATE');
};

export const broadcastPlayerDisconnected = (game: Game, player: Player) => {
  broadcastPlayerEvent(game, player, 'DISCONNECT');
};

export const sendPlayerUpdate = (game: Game, player: Player) => {
  WebsocketService.publish(getGamePath(game), {
    objectType: 'COMPANY',
    eventType: 'UPDATE',
    body: PlayerMapper.mapFull(player),
  }, {
    user: player.userName,
  });
};

export const broadcastMessageToGeneralChat = (message) => {
  broadcastMessage(process.env.GAME_LIST_ROUTE, message);
};

export const broadcastMessageToGameChat = (game: Game, message) => {
  broadcastMessage(getGamePath(game), message);
};

export const broadcastNewGameEvent = (game: Game) => {
  broadcastUpdateGameEvent(game);
  broadcastGameEvent(game, 'UPDATE', GameMapper.mapFull(game));
};

export default {
  broadcastAddGameEvent,
  broadcastRemoveGameEvent,
  broadcastPlayerReconnected,
  broadcastUpdateGameEvent,
  broadcastPlayerConnected,
  broadcastMessageToGeneralChat,
  broadcastMessageToGameChat,
  broadcastNewGameEvent,
  broadcastPlayerUpdated,
  broadcastPlayerDisconnected,
  sendPlayerUpdate,
};
