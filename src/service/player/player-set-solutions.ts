import { getRepository } from "typeorm";

import { Player } from "../../entity/player/Player";
import { Company } from "../../entity/player/Company";
import { PlayerState } from "../../entity/player/PlayerState";
import { Game } from "../../entity/game/Game";
import { Scenario } from "../../entity/game/Scenario";

const setPlayerSolutions = async (game: Game, player: Player, solutions) => {
  const company: Company = player.companyPeriods[player.companyPeriods.length - 1];
  const scenario: Scenario = game.scenario;

  const availableMoney: number = scenario.loanLimit + scenario.extraLoanLimit + company.bank - company.loan;

  let expenses: number = Math.round(solutions.investments + solutions.marketing + solutions.nir
    + company.productionCost * company.production);

  if (expenses > availableMoney) {
    expenses -= solutions.marketing;
    solutions.marketing = 0;
  }

  if (expenses > availableMoney) {
    expenses -= solutions.nir;
    solutions.nir = 0;
  }

  if (expenses > availableMoney) {
    expenses -= company.productionCost * solutions.production;
    solutions.production = 0;
  }

  if (expenses > availableMoney) {
    expenses -= solutions.investments;
    solutions.investments = 0;
  }

  if (expenses > availableMoney) {
    player.isBankrupt = true;
  }

  company.price = solutions.price;
  company.production = solutions.production;
  company.marketing = solutions.marketing;
  company.investments = solutions.investments;
  company.nir = solutions.nir;
  player.state = PlayerState.WAIT;

  return getRepository(Player).save(player);
};

export default setPlayerSolutions;
