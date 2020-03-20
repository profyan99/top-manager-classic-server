import {EntityManager} from "typeorm";

import {Game} from "../../entity/game/Game";
import {User} from "../../entity/user/User";
import {Player} from "../../entity/player/Player";
import {PlayerState} from "../../entity/player/PlayerState";
import {Company} from "../../entity/player/Company";

const addPlayer = async (user: User, game: Game, companyName: string, em: EntityManager): Promise<Player> => {
  const playersAmount = game.maxPlayers;
  const playerRepository = em.getRepository(Player);
  const companyRepository = em.getRepository(Company);

  const player: Player = new Player();
  player.game = game;
  player.user = user;
  player.userName = user.userName;
  player.companyName = companyName;
  player.state = PlayerState.WAIT;
  player.isBankrupt = false;

  const initialCompany = new Company();
  initialCompany.period = 0;
  initialCompany.receivedOrders = 3600 / playersAmount;
  initialCompany.machineTools = 4200 / playersAmount;

  initialCompany.price = 30;
  initialCompany.production = 3360 / playersAmount;
  initialCompany.marketing = 8400 / playersAmount;
  initialCompany.investments = 4200 / playersAmount * 2;
  initialCompany.nir = 3360 / playersAmount;

  initialCompany.bank = 85870 / playersAmount;
  initialCompany.loan = 72240 / playersAmount;
  initialCompany.initialAccumulatedProfit = 4200 / playersAmount;
  initialCompany.productionCost = 18;
  initialCompany.futurePower = 4200 / playersAmount;
  initialCompany.sales = 3360 / playersAmount;
  initialCompany.sumNir = 3360 / playersAmount;

  const firstPeriodCompany = new Company();
  firstPeriodCompany.period = 1;
  firstPeriodCompany.price = 30;
  firstPeriodCompany.production = 3360 / playersAmount;
  firstPeriodCompany.marketing = 8400 / playersAmount;
  firstPeriodCompany.investments = 4200 / playersAmount * 2;
  firstPeriodCompany.nir = 3360 / playersAmount;

  await companyRepository.save(initialCompany);
  await companyRepository.save(firstPeriodCompany);

  player.companyPeriods = [];
  player.companyPeriods.push(initialCompany);
  player.companyPeriods.push(firstPeriodCompany);

  return playerRepository.save(player);
};

export default addPlayer;
