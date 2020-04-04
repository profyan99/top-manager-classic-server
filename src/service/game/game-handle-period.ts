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

    await removeInactivePlayers(game.players, currentTime, game.id, em);

    game.isSendSolutionsAllowed = false;
    game.playersSolutionsAmount = 0;

    const newGamePeriod = await calculateGame(game, em);
    game.periods.push(newGamePeriod);

    let playerCompanyPeriod;
    if (game.currentPeriod >= game.maxPeriods || game.getBankruptCount() >= game.players.length) {
      game.state = GameState.END;
      game.currentPeriod = game.maxPeriods;
      playerCompanyPeriod = game.currentPeriod + 1;
      broadcastEndGamePeriodEvent(game, playerCompanyPeriod);
      server.logger().info(`Game ${game.name}[${game.id}]: was ended`);
    } else {
      game.currentPeriod = Math.min(game.currentPeriod + 1, game.maxPeriods);
      game.isSendSolutionsAllowed = true;

      for (const player of game.players) {
        player.state = PlayerState.THINK;
        const newCompany: Company = await addNewCompany(game, player, em);
        player.companyPeriods.push(newCompany);
        await em.save(player);
      }
      game.startCountDownTime = Date.now();
      playerCompanyPeriod = game.currentPeriod;
      broadcastNewGamePeriodEvent(game, playerCompanyPeriod);
      server.logger().info(`Game ${game.name}[${game.id}]: new period [${game.currentPeriod}]`);
    }

    game.players.forEach((player) => sendPlayerUpdate(game, player, playerCompanyPeriod - 1));
    return gameRepository.save(game);
  });
};

export default handleNewPeriod;

