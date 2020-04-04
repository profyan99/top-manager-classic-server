import { getCustomRepository } from "typeorm";

import { Player } from "../../entity/player/Player";
import { Game } from "../../entity/game/Game";
import { GameState } from "../../entity/game/GameState";
import { PlayerRepository } from "../../repository/player-repository";

const handlePlayerDisconnect = async (game: Game, player: Player): Promise<Player> => {
  const playerRepository = getCustomRepository(PlayerRepository);

  if(!player.isConnected || game.state !== GameState.PLAY) {
    game.players.splice(game.players.indexOf(player), 1);
    return playerRepository.remove(player);
  } else {
    player.isConnected = false;
    player.timeToEndReload = Date.now() + game.periodDuration;
    return playerRepository.save(player);
  }
};

export default handlePlayerDisconnect;
