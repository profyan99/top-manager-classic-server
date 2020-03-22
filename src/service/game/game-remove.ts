import { getCustomRepository, getRepository } from "typeorm";

import { Game } from "../../entity/game/Game";
import { broadcastRemoveGameEvent } from "../game-message-sender-service";
import { server } from '../../index';
import { PlayerRepository } from "../../repository/player-repository";

const removeGame = async (game: Game) => {
  const playerRepository = getCustomRepository(PlayerRepository);

  server.logger().info(`Game ${game.id}: remove game [players: ${game.players.length}]`);

  broadcastRemoveGameEvent(game);

  await Promise.all(game.players.map((player) => {
    player.isRemoved = true;
    return playerRepository.save(player);
  }));
  game.isRemoved = true;
  return getRepository(Game).save(game);
};

export default removeGame;
