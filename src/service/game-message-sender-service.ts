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

const broadcastPlayerEvent = (game: Game, player: Player, eventType: string, period: number) => {
  WebsocketService.publish(getGamePath(game), {
    objectType: 'PLAYER',
    eventType: eventType,
    body: PlayerMapper.mapPreviewByPeriod(player, period),
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

export const broadcastPlayerReconnected = (game: Game, player: Player, period: number) => {
  broadcastPlayerEvent(game, player, 'RECONNECT', period);
};

export const broadcastPlayerConnected = (game: Game, player: Player, period: number) => {
  broadcastPlayerEvent(game, player, 'CONNECT', period);
};

export const broadcastPlayerUpdated = (game: Game, player: Player, period: number) => {
  broadcastPlayerEvent(game, player, 'UPDATE', period);
};

export const broadcastPlayerDisconnected = (game: Game, player: Player, period: number) => {
  broadcastPlayerEvent(game, player, 'DISCONNECT', period);
};

export const sendPlayerUpdate = (game: Game, player: Player, period: number) => {
  WebsocketService.publish(getGamePath(game), {
    objectType: 'COMPANY',
    eventType: 'UPDATE',
    body: PlayerMapper.mapFullByPeriod(player, period),
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

export const broadcastNewGamePeriodEvent = (game: Game, period: number) => {
  broadcastUpdateGameEvent(game);
  broadcastGameEvent(game, 'UPDATE', GameMapper.mapFull(game, period));
};

export const broadcastEndGamePeriodEvent = (game: Game, period: number) => {
  broadcastUpdateGameEvent(game);
  broadcastGameEvent(game, 'END', GameMapper.mapFull(game, period));
};

export const broadcastGamesMetaDataUpdateEvent = (payload: object) => {
  WebsocketService.publish(process.env.GAME_LIST_ROUTE, {
    objectType: 'GAME_PREVIEW_META',
    eventType: 'UPDATE',
    body: payload,
  });
};

export const broadcastRestartGameEvent = (game: Game, payload: object) => {
  broadcastGameEvent(game, 'RESTART', payload);
};

export const broadcastRejectRestartGameEvent = (game: Game, player: Player) => {
  broadcastPlayerEvent(game, player,'RESTART_REJECT', game.currentPeriod);
};

export default {
  broadcastAddGameEvent,
  broadcastRemoveGameEvent,
  broadcastPlayerReconnected,
  broadcastUpdateGameEvent,
  broadcastPlayerConnected,
  broadcastMessageToGeneralChat,
  broadcastMessageToGameChat,
  broadcastNewGamePeriodEvent,
  broadcastEndGamePeriodEvent,
  broadcastPlayerUpdated,
  broadcastPlayerDisconnected,
  broadcastGamesMetaDataUpdateEvent,
  broadcastRestartGameEvent,
  broadcastRejectRestartGameEvent,
  sendPlayerUpdate,
};
