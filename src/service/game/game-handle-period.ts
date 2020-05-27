import { getManager } from "typeorm";

import { Game } from "../../entity/game/Game";
import { PlayerState } from "../../entity/player/PlayerState";
import addNewCompany from "../player/player-add-new-company";
import {
  broadcastNewGamePeriodEvent,
  sendPlayerUpdate
} from "../game-message-sender-service";
import { GameRepository } from "../../repository/game-repository";
import calculateGame from "./game-calculation";
import removeInactivePlayers from "./game-remove-players";
import { Company } from "../../entity/player/Company";
import endGame from './game-end';
import logger from '../../logging';

const handleNewPeriod = async (game: Game, currentTime: number) => {
  return await getManager().transaction(async em => {
    const gameRepository = em.getCustomRepository(GameRepository);

    await removeInactivePlayers(game, currentTime, em);

    game.isSendSolutionsAllowed = false;
    game.playersSolutionsAmount = 0;

    const newGamePeriod = await calculateGame(game, em);
    game.periods.push(newGamePeriod);

    if (game.currentPeriod >= game.maxPeriods || game.getBankruptCount() >= game.players.length) {
      await endGame(game, em);
    } else {
      const actualPlayers = game.getActualPlayers();
      game.currentPeriod = Math.min(game.currentPeriod + 1, game.maxPeriods);
      game.isSendSolutionsAllowed = true;

      for (const player of actualPlayers) {
        player.state = PlayerState.THINK;
        const newCompany: Company = await addNewCompany(game, player, em);
        player.companyPeriods.push(newCompany);
        await em.save(player);
      }
      game.startCountDownTime = Date.now();
      broadcastNewGamePeriodEvent(game, game.currentPeriod);
      actualPlayers.forEach((player) => sendPlayerUpdate(game, player, game.currentPeriod - 1));
      logger.info(`Game ${game.name}[${game.id}]: new period [${game.currentPeriod}]`);
    }
    return gameRepository.save(game);
  });
};

export default handleNewPeriod;

