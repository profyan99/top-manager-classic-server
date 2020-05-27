import { EntityManager } from 'typeorm';

import { Game } from '../../entity/game/Game';
import { GameState } from '../../entity/game/GameState';
import { User } from '../../entity/user/User';
import { broadcastEndGamePeriodEvent, sendPlayerUpdate } from '../game-message-sender-service';
import logger from '../../logging';

const endGame = async (game: Game, em: EntityManager) => {
  const userRepository = em.getRepository(User);
  game.state = GameState.END;
  game.currentPeriod = game.maxPeriods;

  const actualPlayers = game.getActualPlayers();

  const winner = actualPlayers
    .reduce((winner, currentPlayer) =>
      winner.getCompanyByPeriod(game.currentPeriod).rating
      > currentPlayer.getCompanyByPeriod(game.currentPeriod).rating
        ? winner
        : currentPlayer);

  const userUpdates = actualPlayers.map(async (player) => {
    const currentUser = await userRepository.findOne(player.user.id);
    currentUser.gameStats.gamesAmount += 1;

    if (game.tournament) {
      currentUser.gameStats.tournamentAmount += 1;
    }

    currentUser.gameStats.hoursInGame += (game.periodDuration * game.maxPeriods) / 3600.;
    currentUser.gameStats.maxRevenue = Math.max(
      currentUser.gameStats.maxRevenue,
      player.getCompanyByPeriod(game.currentPeriod).revenue
    );
    currentUser.gameStats.maxRating = Math.max(
      currentUser.gameStats.maxRating,
      player.getCompanyByPeriod(game.currentPeriod).rating
    );

    if (player.id === winner.id) {
      currentUser.gameStats.winAmount += 1;
    } else {
      currentUser.gameStats.loseAmount += 1;
    }

    return userRepository.save(currentUser);
  });
  await Promise.all(userUpdates);

  broadcastEndGamePeriodEvent(game, game.currentPeriod + 1);
  actualPlayers.forEach((player) => sendPlayerUpdate(game, player, game.currentPeriod));

  logger.info(`Game ${game.name}[${game.id}]: was ended. ${winner.companyName} with ${winner.getCompanyByPeriod(game.currentPeriod).rating} rating win!`);
};

export default endGame;
