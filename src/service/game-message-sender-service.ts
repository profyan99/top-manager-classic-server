import {Game} from "../entity/game/Game";
import WebsocketService from './websocket-service';
import GameMapper from '../mapper/game-mapper';
import PlayerMapper from '../mapper/player-mapper';
import {Player} from "../entity/player/Player";

const broadcastGamePreviewEvent = (game: Game, eventType: string) => {
  WebsocketService.publish(process.env.GAME_LIST_ROUTE, {
    objectType: 'GAME_PREVIEW',
    eventType: eventType,
    body: GameMapper.mapPreview(game),
  });
};

const broadcastPlayerEvent = (game: Game, player: Player, eventType: string) => {
  WebsocketService.publish(`${process.env.GAME_ROUTE}/${game.id}`, {
    objectType: 'PLAYER',
    eventType: eventType,
    body: PlayerMapper.mapPreview(player),
  });
};

export const broadcastAddGameEvent = (game: Game) => {
  broadcastGamePreviewEvent(game, 'ADD');
};

export const broadcastRemoveGameEvent = (game: Game) => {
  broadcastGamePreviewEvent(game, 'REMOVE');
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

export const sendPlayerUpdate = (game: Game, player: Player) => {
  WebsocketService.publish(process.env.GAME_LIST_ROUTE, {
    objectType: 'COMPANY',
    eventType: 'UPDATE',
    body: PlayerMapper.mapFull(player),
  }, {
    user: player.userName,
  });
};

export default {
  broadcastAddGameEvent,
  broadcastRemoveGameEvent,
  broadcastPlayerReconnected,
  broadcastUpdateGameEvent,
  broadcastPlayerConnected,
};
