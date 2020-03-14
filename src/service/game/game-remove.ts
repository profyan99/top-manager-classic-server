import { Game } from "../../entity/game/Game";
import { getRepository } from "typeorm";
import { broadcastRemoveGameEvent } from "../game-message-sender-service";
import { Player } from "../../entity/player/Player";

const removeGame = async (game: Game) => {
  const playerRepository = getRepository(Player);

  console.log('Remove game: ', game.name);

  broadcastRemoveGameEvent(game);
  await Promise.all(game.players.map((player) => playerRepository.remove(player)));
  game.isRemoved = true;
  await getRepository(Game).save(game);
};

export default removeGame;
