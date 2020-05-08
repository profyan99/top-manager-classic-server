import { getCustomRepository } from "typeorm";

import { Player } from "../../entity/player/Player";
import { Game } from "../../entity/game/Game";
import { GameState } from "../../entity/game/GameState";
import { PlayerRepository } from "../../repository/player-repository";

const handlePlayerRemove = async (game: Game, player: Player): Promise<Player> => {
  const playerRepository = getCustomRepository(PlayerRepository);

  if(!player.isConnected) {
    if(game.state === GameState.PREPARE) {
      game.players.splice(game.players.indexOf(player), 1);
      return playerRepository.remove(player);
    }
    player.isRemoved = true;
  } else {
    player.timeToEndReload = Date.now() + game.periodDuration;
  }
  player.isConnected = false;
  return playerRepository.save(player);
};

export default handlePlayerRemove;
