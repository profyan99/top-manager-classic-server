import { Company } from "../../entity/player/Company";
import { Game } from "../../entity/game/Game";
import { Scenario } from "../../entity/game/Scenario";

const calculateCompany = (companyOld: Company, companyNew: Company, game: Game) => {
  const scenario: Scenario = game.scenario;

  companyNew.storageCost = companyOld.storage; // стоимость хранения = склад
  companyNew.fullPower = companyOld.futurePower;
  companyNew.machineTools = companyOld.machineTools;

  // если спрос > предложения
  if (companyNew.production + companyOld.storage < companyNew.receivedOrders) {
    companyNew.sales = companyNew.production + companyOld.storage;
    companyNew.storage = 0;
    companyNew.backlogSales = companyNew.receivedOrders - companyOld.sales;
  } else {
    companyNew.sales = companyNew.receivedOrders;
    companyNew.storage = companyOld.storage - companyNew.receivedOrders + companyNew.production;
    companyNew.backlogSales = 0;
  }

  // Выручка
  companyNew.revenue = companyNew.price * companyNew.sales;

  // амортизация
  if (companyNew.investments < companyOld.machineTools * 2) {
    const machines: number = companyOld.machineTools;
    companyNew.machineTools = Math.round(machines - (machines * 2 - companyNew.investments) / 40);
  }
  companyNew.amortization = companyNew.machineTools * 2;
  companyNew.additionalInvestments = Math.max(0, companyNew.investments - companyNew.amortization);

  // мощность след.периода
  companyNew.futurePower = Math.round((companyNew.additionalInvestments + companyNew.machineTools * 40) / 40);
  companyNew.machineTools = companyNew.futurePower;

  // используемая мощность в %
  companyNew.usingPower = companyNew.production / companyNew.fullPower;
  companyNew.SPPT = Math.round(companyNew.sales * companyOld.productionCost);

  const usingPower: number = companyNew.usingPower;
  let coefficient = 5. * Math.pow(usingPower, 2.) - 8. * usingPower + 4.2;
  if (usingPower === 0) {
    coefficient = 1.;
  }
  companyNew.productionCost = (((4200. / game.maxPlayers) / companyNew.futurePower) * 15. + 3.) * coefficient;
  companyNew.usingPower = companyNew.usingPower * 100;

  const expenses: number = Math.round(companyNew.investments + companyNew.nir + companyNew.marketing
    + companyNew.productionCost * companyNew.production);

  // займы
  companyNew.loan = companyOld.loan;
  companyNew.bank = companyOld.bank;
  if (companyNew.bank - expenses < 0) {
    companyNew.loan = companyNew.loan + companyNew.bank - expenses;
  }

  if (companyNew.loan < scenario.loanLimit) {
    companyNew.bankInterest = Math.round(companyNew.loan * scenario.bankRate / 4.);
  } else {
    companyNew.bankInterest =  Math.round(scenario.loanLimit * scenario.bankRate / 4.
    + (companyNew.loan - scenario.loanLimit) * scenario.extraBankRate / 4.);
  }

  // тайные отнимания
  companyNew.productionCostAll = Math.round(companyNew.productionCost * companyNew.production);

  companyNew.grossIncome = companyNew.revenue - companyNew.SPPT;
  companyNew.profitTax = companyNew.revenue -
    (companyNew.storageCost
      + companyNew.bankInterest
      + companyNew.SPPT
      + companyNew.amortization
      + companyNew.marketing
      + companyNew.nir)
  ;

  if (companyNew.bank < companyNew.additionalInvestments) {
    companyNew.loan += companyNew.additionalInvestments - companyNew.bank;
    companyNew.bank = 0;
  } else {
    companyNew.bank -= companyNew.additionalInvestments;
  }

  // Прибыль до налога...
  companyNew.tax = Math.max(Math.round(companyNew.profitTax * 0.25), 0);
  companyNew.netProfit = companyNew.profitTax - companyNew.tax;

  if (companyNew.netProfit > 0) {
    const loanIncome = Math.round(0.75 * companyNew.netProfit);
    companyNew.loan -= loanIncome;
    companyNew.bank += companyNew.netProfit - loanIncome;
  } else {
    companyNew.bank += companyNew.netProfit;
    if (companyNew.bank < 0) {
      companyNew.loan -= companyNew.bank;
      companyNew.bank = 0;
    }
  }

  companyNew.accumulatedProfit += companyNew.netProfit;
  companyNew.activeStorage = Math.round(companyNew.storage * companyNew.productionCost);
  companyNew.kapInvests = companyNew.fullPower * 40;
  companyNew.sumActives = companyOld.kapInvests + companyNew.activeStorage + companyNew.bank;

  companyNew.sumMarketing += companyNew.marketing;
  companyNew.sumNir += companyNew.nir;
  companyNew.sumProduction += companyNew.production;

  companyNew.initialAccumulatedProfit = companyOld.initialAccumulatedProfit;
  console.log('CURRENT COMPANY CALCULATION: ',companyNew.initialAccumulatedProfit, companyOld.initialAccumulatedProfit);
  return companyNew;
};

export default calculateCompany;
