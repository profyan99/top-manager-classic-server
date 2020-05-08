import { getRepository } from "typeorm";

import { Game } from "../../entity/game/Game";
import { broadcastRemoveGameEvent } from "../game-message-sender-service";
import { server } from '../../index';
import handlePlayerRemove from '../player/player-remove';

const removeGame = async (game: Game) => {
  server.logger().info(`Game [${game.name}](${game.id}): remove game [players: ${game.players.length}]`);

  broadcastRemoveGameEvent(game);

  await Promise.all(game.players.map((player) => {
    player.isConnected = false;
    return handlePlayerRemove(game, player);
  }));
  game.isRemoved = true;
  return getRepository(Game).save(game);
};

export default removeGame;
