import { getManager } from "typeorm";

import { Game } from "../../entity/game/Game";
import { GameState } from "../../entity/game/GameState";
import { PlayerState } from "../../entity/player/PlayerState";
import addNewCompany from "../player/player-add-new-company";
import {
  broadcastEndGamePeriodEvent,
  broadcastNewGamePeriodEvent,
  sendPlayerUpdate
} from "../game-message-sender-service";
import { GameRepository } from "../../repository/game-repository";
import calculateGame from "./game-calculation";
import removeInactivePlayers from "./game-remove-players";
import { Company } from "../../entity/player/Company";
import { server } from "../../index";

const handleNewPeriod = async (game: Game, currentTime: number) => {
  return await getManager().transaction(async em => {
    const gameRepository = em.getCustomRepository(GameRepository);

    server.logger().info(`Game ${game.id}: calculation period [${game.currentPeriod}]`);
    await removeInactivePlayers(game.players, currentTime, game.id, em);

    game.isSendSolutionsAllowed = false;
    game.playersSolutionsAmount = 0;

    const newGamePeriod = await calculateGame(game, em);
    game.periods.push(newGamePeriod);

    let gamePayloadSendingPeriod;
    if (game.currentPeriod >= game.maxPeriods) {
      game.state = GameState.END;
      gamePayloadSendingPeriod = game.currentPeriod + 1;
      broadcastEndGamePeriodEvent(game, gamePayloadSendingPeriod);
      server.logger().info(`Game ${game.id}: end [${game.currentPeriod} / ${game.maxPeriods}]`);
    } else {
      game.currentPeriod = Math.min(game.currentPeriod + 1, game.maxPeriods);
      game.isSendSolutionsAllowed = true;

      for (const player of game.players) {
        player.state = PlayerState.THINK;
        const newCompany: Company = await addNewCompany(game, player, em);
        player.companyPeriods.push(newCompany);
        await em.save(player);
      }
      gamePayloadSendingPeriod = game.currentPeriod;
      game.startCountDownTime = Date.now();
      broadcastNewGamePeriodEvent(game, gamePayloadSendingPeriod);
      server.logger().info(`Game ${game.id}: new period [${game.currentPeriod}]`);
    }

    game.players.forEach((player) => sendPlayerUpdate(game, player, gamePayloadSendingPeriod));

    return gameRepository.save(game);
  });
};

export default handleNewPeriod;

