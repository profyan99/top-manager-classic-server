import { getManager } from 'typeorm';

import { Player } from '../../entity/player/Player';
import { Company } from '../../entity/player/Company';
import { PlayerState } from '../../entity/player/PlayerState';
import { Game } from '../../entity/game/Game';
import { Scenario } from '../../entity/game/Scenario';
import { PlayerRepository } from '../../repository/player-repository';
import logger from '../../logging';

const setPlayerSolutions = async (game: Game, player: Player, solutions) => {
  return await getManager().transaction(async em => {
    const oldCompany: Company = player.getCompanyByPeriod(
      game.currentPeriod - 1,
    );
    const currentCompany: Company = player.getCompanyByPeriod(
      game.currentPeriod,
    );
    const scenario: Scenario = game.scenario;

    const availableMoney: number =
      scenario.loanLimit +
      scenario.extraLoanLimit +
      oldCompany.bank -
      oldCompany.loan;

    let expenses: number = Math.round(
      solutions.investments +
        solutions.marketing +
        solutions.nir +
        oldCompany.productionCost * solutions.production,
    );

    logger.debug(
      `[Solutions] AvailableMoney of ${player.companyName}: `,
      scenario.loanLimit,
      scenario.extraLoanLimit,
      oldCompany.bank - oldCompany.loan,
    );
    logger.debug(`[Solutions] Expenses of ${player.companyName}: `, {
      prod: oldCompany.productionCost * oldCompany.production,
      investments: solutions.investments,
      nir: solutions.nir,
      marketing: solutions.marketing,
    });
    logger.debug(
      `[Solutions] Summary expenses and available
       money of ${player.companyName}: `,
      {
        solutions,
        expenses,
        availableMoney,
      },
    );

    if (expenses > availableMoney) {
      expenses -= solutions.marketing;
      solutions.marketing = 0;
    }

    if (expenses > availableMoney) {
      expenses -= solutions.nir;
      solutions.nir = 0;
    }

    if (expenses > availableMoney) {
      expenses -= oldCompany.productionCost * solutions.production;
      solutions.production = 0;
    }

    if (expenses > availableMoney) {
      expenses -= solutions.investments;
      solutions.investments = 0;
    }

    if (expenses > availableMoney) {
      player.isBankrupt = true;
    }

    currentCompany.price = solutions.price;
    currentCompany.production = solutions.production;
    currentCompany.marketing = solutions.marketing;
    currentCompany.investments = solutions.investments;
    currentCompany.nir = solutions.nir;

    player.state = PlayerState.WAIT;
    await em.getRepository(Company).save(currentCompany);
    return em.getCustomRepository(PlayerRepository).save(player);
  });
};

export default setPlayerSolutions;
