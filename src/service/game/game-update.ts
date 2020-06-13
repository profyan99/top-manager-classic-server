import { Game } from '../../entity/game/Game';
import { GameState } from '../../entity/game/GameState';
import handleNewPeriod from './game-handle-period';
import { getCustomRepository } from 'typeorm';
import { GameRepository } from '../../repository/game-repository';
import * as GameHandler from './index';
import logger from '../../logging';

const updateGame = async (gamePreview: Game, currentTime: number) => {
  const timeDiff = Math.round(
    (currentTime - gamePreview.startCountDownTime) / 1000,
  );

  if (
    gamePreview.state === GameState.PREPARE &&
    gamePreview.players.length >= gamePreview.maxPlayers &&
    gamePreview.players.every(player => player.isConnected)
  ) {
    logger.info(`Game ${gamePreview.name}[${gamePreview.id}]: start`);
    const game: Game = await getCustomRepository(GameRepository).findOneFull(
      gamePreview.id,
    );
    game.state = GameState.PLAY;
    return GameHandler.handleNewPeriod(game, currentTime);
  }

  if (
    (timeDiff >= gamePreview.periodDuration ||
      gamePreview.isAllSendSolutions()) &&
    gamePreview.state === GameState.PLAY
  ) {
    const game: Game = await getCustomRepository(GameRepository).findOneFull(
      gamePreview.id,
    );
    return handleNewPeriod(game, currentTime);
  }
};

export default updateGame;
