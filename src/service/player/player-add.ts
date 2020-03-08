import {getRepository} from "typeorm";

import {Game} from "../../entity/game/Game";
import {User} from "../../entity/user/User";
import {Player} from "../../entity/player/Player";
import {PlayerState} from "../../entity/player/PlayerState";
import {Company} from "../../entity/player/Company";

const addPlayer = async (user: User, game: Game, companyName: string): Promise<Player> => {
  const playersAmount = game.players.length;
  const playerRepository = getRepository(Player);

  const player: Player = new Player();
  player.game = game;
  player.companyName = companyName;
  player.state = PlayerState.WAIT;
  player.isBankrupt = false;

  const initialCompany = new Company();
  initialCompany.period = -1;
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

  const zeroPeriodCompany = new Company();
  zeroPeriodCompany.price = 30;
  zeroPeriodCompany.production = 3360 / playersAmount;
  zeroPeriodCompany.marketing = 8400 / playersAmount;
  zeroPeriodCompany.investments = 4200 / playersAmount * 2;
  zeroPeriodCompany.nir = 3360 / playersAmount;

  player.companyPeriods.push(initialCompany);
  player.companyPeriods.push(zeroPeriodCompany);

  return playerRepository.save(player);
};

export default addPlayer;
