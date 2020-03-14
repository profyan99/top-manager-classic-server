import { getManager } from "typeorm";

import { Game } from "../../entity/game/Game";
import { GameState } from "../../entity/game/GameState";
import { PlayerState } from "../../entity/player/PlayerState";
import addNewCompany from "../player/player-add-new-company";
import { broadcastNewGameEvent, sendPlayerUpdate } from "../game-message-sender-service";
import { GameRepository } from "../../repository/game-repository";

export const handleNewPeriod = async (game: Game) => {
  return await getManager().transaction(async em => {
    game.startCountDownTime = Date.now();
    game.isSendSolutionsAllowed = false;
    game.playersSolutionsAmount = 0;

    //TODO calc game
    if (game.currentPeriod === game.maxPeriods) {
      game.state = GameState.END;
    } else {
      game.currentPeriod = Math.min(game.currentPeriod + 1, game.maxPeriods);
      game.isSendSolutionsAllowed = true;

      for (let player of game.players) {
        player.state = PlayerState.THINK;
        await addNewCompany(game, player, em);
      }
    }

    broadcastNewGameEvent(game);
    game.players.forEach((player) => sendPlayerUpdate(game, player));

    return em.getCustomRepository(GameRepository).save(game);
  });
};

