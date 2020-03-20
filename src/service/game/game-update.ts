import { Game } from "../../entity/game/Game";
import { GameState } from "../../entity/game/GameState";
import handleNewPeriod from "./game-handle-period";
import { server } from '../../index';
import { getCustomRepository } from "typeorm";
import { GameRepository } from "../../repository/game-repository";
import GameHandler from "./index";

const updateGame = async (gamePreview: Game, currentTime: number) => {
  const timeDiff = Math.round((currentTime - gamePreview.startCountDownTime) / 1000);

  if(gamePreview.state === GameState.PREPARE && gamePreview.players.length >= gamePreview.maxPlayers) {
    server.logger().info(`Game ${gamePreview.name}[${gamePreview.id}]: start`);
    const game: Game = await getCustomRepository(GameRepository).findOneFull(gamePreview.id);
    game.state = GameState.PLAY;
    return GameHandler.handleNewPeriod(game, currentTime);
  }

  if (timeDiff >= gamePreview.periodDuration && gamePreview.state === GameState.PLAY) {
    server.logger().info(`Game ${gamePreview.id}: new period [${gamePreview.currentPeriod + 1}]`);

    const game: Game = await getCustomRepository(GameRepository).findOneFull(gamePreview.id);
    return handleNewPeriod(game, currentTime);
  }
};

export default updateGame;
