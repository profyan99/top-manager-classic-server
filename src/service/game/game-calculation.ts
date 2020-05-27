import { EntityManager } from 'typeorm';

import { Game } from '../../entity/game/Game';
import { GamePeriod } from '../../entity/game/GamePeriod';
import { Company } from '../../entity/player/Company';
import { calculatePlayer } from '../player';
import { Scenario } from '../../entity/game/Scenario';
import logger from '../../logging';

const getBuyersForCompany = (company: Company, period: GamePeriod, scenario: Scenario, industryBuyersAmount: number) => {
  let nir = 0;
  let marketing = 0;

  const price = industryBuyersAmount * scenario.sharePriceEffect * Math.pow(1. / company.price, 3.) / period.totalPrice;

  if (period.summaryNir > 0) {
    nir = industryBuyersAmount * scenario.shareNirEffect * company.sumNir / period.summaryNir;
  }

  if (period.totalMarketing > 0) {
    marketing = industryBuyersAmount * scenario.shareMarketingEffect *
      Math.pow(company.marketing / company.price, 1.5) / period.totalMarketing;
  }

  return Math.round(marketing + price + nir);
};

const smartDivide = (first: number, second: number, defaultValue: number) => {
  return second === 0 ? defaultValue : first / second;
};

//TODO
// eslint-disable-next-line @typescript-eslint/no-empty-function
const alternativeCalculation = async (game: Game, em: EntityManager) => {

};

const calculateGame = async (game: Game, em: EntityManager) => {
  const currentPeriodNumber: number = game.currentPeriod;
  const period: GamePeriod = new GamePeriod();
  const previousPeriod: GamePeriod = game.periods[game.currentPeriod];
  const scenario: Scenario = game.scenario;

  logger.info(`Game ${game.name}[${game.id}]: calculating ${game.currentPeriod} period`);

  const companies = game.getActualPlayers();

  period.period = game.currentPeriod;
  period.summaryMarketing = previousPeriod.summaryMarketing;
  period.summaryNir = previousPeriod.summaryNir;
  period.summaryProduction = previousPeriod.summaryProduction;

  companies.forEach((player) => {
    const companyData: Company = player.getCompanyByPeriod(currentPeriodNumber);
    const companyDataPrevious: Company = player.getCompanyByPeriod(currentPeriodNumber - 1);

    companyData.price = companyData.price || companyDataPrevious.price;

    period.summaryPeriodMarketing += companyData.marketing;
    period.averagePeriodPrice += companyData.price;
    period.summaryNir += companyData.nir;
    period.summaryMarketing += companyData.marketing;
    period.summaryProduction += companyData.production;

    period.totalMarketing += Math.pow(companyData.marketing / companyData.price, 1.5);
    period.totalPrice += Math.pow(1. / companyData.price, 3.);

    companyData.sumNir = companyDataPrevious.sumNir;
    companyData.maxPredictedSales = companyDataPrevious.storage + companyData.production;
    companyData.maxPredictedRevenue = companyData.price * companyData.maxPredictedSales;
  });

  period.averagePeriodPrice = period.averagePeriodPrice / companies.length;

  const sumMarketing: number = period.summaryMarketing;
  period.summaryPeriodMarketing =
    sumMarketing > 16800 ? Math.sqrt(sumMarketing / 4. + 12600.) : Math.sqrt(sumMarketing);

  // calculate total buyers amount
  period.totalBuyers = Math.round(
    (period.summaryPeriodMarketing / period.averagePeriodPrice) * 950
    + period.summaryNir / (3.67 * (currentPeriodNumber + 2))
  );

  if (period.averagePeriodPrice > 40.) {
    period.totalBuyers = Math.round(period.totalBuyers * 40. / period.averagePeriodPrice);
  }

  // calculate buyers for each company
  let buyersForRichPrice = 0;
  for (const player of companies) {
    const company: Company = player.getCompanyByPeriod(currentPeriodNumber);

    const companyBuyers: number = getBuyersForCompany(company, period, scenario, period.totalBuyers);
    company.receivedOrders = companyBuyers;
    if (company.price > 40) {
      company.receivedOrders = Math.round(companyBuyers * 40. / company.price);
      buyersForRichPrice += companyBuyers - company.receivedOrders;
    }
  }

  if (buyersForRichPrice > 0) {
    for (const player of companies) {
      const company: Company = player.getCompanyByPeriod(currentPeriodNumber);

      const additionalCompanyBuyers: number = getBuyersForCompany(company, period, scenario, buyersForRichPrice);
      company.receivedOrders += additionalCompanyBuyers;
    }
  }

  // calculate players
  period.totalBuyers = 0;
  for (const player of companies) {
    const currentPeriodCompany: Company = calculatePlayer(player, game);

    period.totalSales += currentPeriodCompany.sales;
    period.summaryPeriodPower += currentPeriodCompany.fullPower;
    period.summaryPeriodProduction += currentPeriodCompany.production;
    period.summaryPeriodStorage += currentPeriodCompany.storage;
    period.summaryPeriodRevenue += currentPeriodCompany.revenue;
    period.averagePeriodProductionCost += currentPeriodCompany.productionCost;
    period.averagePeriodUsingPower += currentPeriodCompany.usingPower;
    period.summaryPeriodKapInvests += currentPeriodCompany.kapInvests;

    period.totalBuyers += currentPeriodCompany.receivedOrders;
  }
  period.averagePeriodProductionCost = period.averagePeriodProductionCost / companies.length;
  period.averagePeriodUsingPower = period.averagePeriodUsingPower / companies.length;

  for (const player of companies) {
    const companyData: Company = player.getCompanyByPeriod(currentPeriodNumber);

    if (period.totalBuyers > 0) {
      companyData.marketingPart = companyData.receivedOrders / period.totalBuyers * 100.;
    }

    const companiesAmount = companies.length;
    const ratingByAccumulatedProfit =
      (
        scenario.ratingProfitEffect * companyData.accumulatedProfit /
        ((currentPeriodNumber + 2) * companyData.initialAccumulatedProfit)
      );

    const ratingByDemand = (companyData.sumMarketing + companyData.sumNir)
      / (period.summaryMarketing + period.summaryNir)
      * companiesAmount * scenario.ratingDemandEffect;

    const ratingBySupply = (companyData.sumProduction / period.summaryProduction) * companiesAmount
      * scenario.ratingSupplyEffect;

    const ratingByEfficiency = (1. - Math.abs(companyData.usingPower - 80.) / 100.) * scenario.ratingEfficiencyEffect;

    const ratingByMarketingPart = Math.min(
      (companyData.receivedOrders / period.totalBuyers * companiesAmount * scenario.ratingMarketingPartEffect),
      20.
    );

    const sales: number = companyData.sales;
    let grow = 0;
    if (sales > 0 && period.totalSales > 0) {
      const salesPrevious = player.getCompanyByPeriod(currentPeriodNumber - 1).sales;
      grow = salesPrevious ? scenario.ratingGrowEffect * sales / salesPrevious / period.totalSales
        * previousPeriod.totalSales : sales;
    }
    const ratingByGrow: number = Math.min(grow, 20.);
    logger.info(`Rating parts of ${player.companyName}:
    \tAP: ${ratingByAccumulatedProfit}
    \tDD: ${ratingByDemand}
    \tSP: ${ratingBySupply}
    \tEF: ${ratingByEfficiency}
    \tMP: ${ratingByMarketingPart}
    \tGR: ${ratingByGrow}
    `);
    companyData.rating = Math.round(
      ratingByAccumulatedProfit
      + ratingByDemand
      + ratingBySupply
      + ratingByEfficiency
      + ratingByMarketingPart
      + ratingByGrow
    );
    await em.save(companyData);

    logger.info(`Game ${game.name}[${game.id}]: calculated ${player.companyName}: `, companyData);
  }

  logger.info(`Game ${game.name}[${game.id}]: calculated period: `, period);
  return em.save(period);
};

export default calculateGame;
