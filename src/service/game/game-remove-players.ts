import { EntityManager } from 'typeorm';

import { addPlayerLeaveGame } from '../user-service';
import { PlayerRepository } from '../../repository/player-repository';
import { Game } from '../../entity/game/Game';
import logger from '../../logging';

const removeInactivePlayers = async (
  game: Game,
  currentTime: number,
  em: EntityManager,
) => {
  const playerRepository = em.getCustomRepository(PlayerRepository);
  const removedPlayers = game
    .getActualPlayers()
    .filter(
      player =>
        !player.isConnected &&
        player.timeToEndReload &&
        player.timeToEndReload < currentTime,
    )
    .map(player => {
      player.isRemoved = true;
      return [
        playerRepository.save(player),
        addPlayerLeaveGame(player.user, em),
      ];
    });

  if (removedPlayers.length) {
    logger.info(
      `Game ${game.name}[${game.id}]:
      removed [${removedPlayers.length}] inactive players`,
    );
  }
  await Promise.all(removedPlayers);
};

export default removeInactivePlayers;
