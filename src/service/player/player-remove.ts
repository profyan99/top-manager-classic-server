import { getCustomRepository } from 'typeorm';

import { Player } from '../../entity/player/Player';
import { Game } from '../../entity/game/Game';
import { GameState } from '../../entity/game/GameState';
import { PlayerRepository } from '../../repository/player-repository';
import logger from '../../logging';

const handlePlayerRemove = async (
  game: Game,
  player: Player,
): Promise<Player> => {
  const playerRepository = getCustomRepository(PlayerRepository);

  if (!player.isConnected) {
    if (game.state === GameState.PREPARE) {
      game.players.splice(game.players.indexOf(player), 1);
      logger.info(`Player ${player.userName} removed from ${game.name}`);
      return playerRepository.remove(player);
    }
    player.isRemoved = true;
  } else {
    player.timeToEndReload = Date.now() + game.periodDuration;
    logger.info(`Player ${player.userName}
     remove with time to reload ${player.timeToEndReload}`);
  }
  player.isConnected = false;
  return playerRepository.save(player);
};

export default handlePlayerRemove;
