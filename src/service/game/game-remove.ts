import { getRepository } from "typeorm";

import { Game } from "../../entity/game/Game";
import { broadcastRemoveGameEvent } from "../game-message-sender-service";
import handlePlayerRemove from '../player/player-remove';
import logger from '../../logging';

const removeGame = async (game: Game) => {
  logger.info(`Game ${game.name}[${game.id}]: removed [players: ${game.players.length}]`);

  broadcastRemoveGameEvent(game);

  await Promise.all(game.players.map((player) => {
    player.isConnected = false;
    return handlePlayerRemove(game, player);
  }));
  game.isRemoved = true;
  return getRepository(Game).save(game);
};

export default removeGame;
