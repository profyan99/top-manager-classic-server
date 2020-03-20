import { getRepository } from "typeorm";

import { Game } from "../../entity/game/Game";
import { broadcastRemoveGameEvent } from "../game-message-sender-service";
import { Player } from "../../entity/player/Player";
import { server } from '../../index';

const removeGame = async (game: Game) => {
  const playerRepository = getRepository(Player);

  server.logger().info(`Game ${game.id}: remove game`, game.players.length);

  broadcastRemoveGameEvent(game);
  await Promise.all(game.players.map((player) => playerRepository.remove(player)));
  game.isRemoved = true;
  await getRepository(Game).save(game);
};

export default removeGame;
