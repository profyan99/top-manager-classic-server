import { Game } from "../../entity/game/Game";
import { GamePeriod } from "../../entity/game/GamePeriod";
import { Company } from "../../entity/player/Company";
import calculateCompany from "../player/player-calculation";
import { server } from "../../index";
import { EntityManager } from "typeorm";

const getBuyersForCompany = (company: Company, period: GamePeriod, industryBuyersAmount: number) => {
  let nir = 0;
  let marketing = 0;

  const price = industryBuyersAmount * 0.7 * Math.pow(1. / company.price, 3.) / period.totalPrice;

  if (period.summaryNir > 0) {
    nir = industryBuyersAmount * 0.15 * company.sumNir / period.summaryNir;
  }

  if (period.totalMarketing > 0) {
    marketing = industryBuyersAmount * 0.15 *
      Math.pow(company.marketing / company.price, 1.5) / period.totalMarketing;
  }

  return Math.round(marketing + price + nir);
};

const calculateGame = async (game: Game, em: EntityManager) => {
  const currentPeriod: number = game.currentPeriod;
  const period: GamePeriod = new GamePeriod();
  const previousPeriod: GamePeriod = game.periods[game.currentPeriod - 1];

  server.logger().info(`Calculate game: ${game.name}[${game.id}]: periods[${game.periods.length}]`);

  const companies = game.players.filter((player) => !player.isBankrupt);

  period.period = game.currentPeriod;
  period.summaryMarketing = previousPeriod.summaryMarketing;
  period.summaryNir = previousPeriod.summaryNir;
  period.summaryProduction = previousPeriod.summaryProduction;

  companies.forEach((player) => {
    const companyData: Company = player.companyPeriods[currentPeriod];

    period.summaryPeriodMarketing += companyData.marketing;
    period.averagePeriodPrice += companyData.price;
    period.summaryNir += companyData.nir;
    period.summaryMarketing += companyData.marketing;
    period.summaryProduction += companyData.production;

    period.totalMarketing += Math.pow(companyData.marketing / companyData.price, 1.5);
    period.totalPrice += Math.pow(1. / companyData.price, 3.);

    companyData.sumNir = player.companyPeriods[currentPeriod - 1].sumNir;
    companyData.maxPredictedSales = player.companyPeriods[currentPeriod - 1].storage + companyData.production;
    companyData.maxPredictedRevenue = companyData.price * companyData.maxPredictedSales;
  });

  period.averagePeriodPrice = period.averagePeriodPrice / companies.length;

  const sumMarketing: number = period.summaryMarketing;
  period.summaryPeriodMarketing =
    sumMarketing > 16800 ? Math.sqrt(sumMarketing / 4. + 12600.) : Math.sqrt(sumMarketing);

  // calculate total buyers amount
  period.totalBuyers = Math.round(
    (period.summaryPeriodMarketing / period.averagePeriodPrice) * 950
    + period.summaryNir / (3.67 * (currentPeriod + 1))
  );

  if (period.averagePeriodPrice > 40.) {
    period.totalBuyers = Math.round(period.totalBuyers * 40. / period.averagePeriodPrice);
  }
  server.logger().info(`Calculate game: ${game.name}[${game.id}]: total consumers [${period.totalBuyers}]`);

  // calculate buyers for each company
  let buyersForRichPrice: number = 0;
  for (let player of companies) {
    const company: Company = player.companyPeriods[currentPeriod];

    const companyBuyers: number = getBuyersForCompany(company, period, period.totalBuyers);
    company.receivedOrders = companyBuyers;
    if(company.price > 40) {
      company.receivedOrders = Math.round(companyBuyers * 40. / company.price);
      buyersForRichPrice += companyBuyers - company.receivedOrders;
    }
  }

  if (buyersForRichPrice > 0) {
    for (let player of companies) {
      const company: Company = player.companyPeriods[currentPeriod];

      const additionalCompanyBuyers: number = getBuyersForCompany(company, period, buyersForRichPrice);
      company.receivedOrders += additionalCompanyBuyers;
    }
  }

  // calculate players
  for (let player of companies) {
    const currentPeriodCompany: Company = calculateCompany(
      player.companyPeriods[currentPeriod - 1], player.companyPeriods[currentPeriod], game
    );

    period.totalSales += currentPeriodCompany.sales;
    period.summaryPeriodPower += currentPeriodCompany.fullPower;
    period.summaryPeriodProduction += currentPeriodCompany.production;
    period.summaryPeriodStorage += currentPeriodCompany.storage;
    period.summaryPeriodRevenue += currentPeriodCompany.revenue;
    period.averagePeriodProductionCost += currentPeriodCompany.productionCost;
    period.averagePeriodUsingPower += currentPeriodCompany.usingPower;
    period.summaryPeriodKapInvests += currentPeriodCompany.kapInvests;
  }
  period.averagePeriodProductionCost = period.averagePeriodProductionCost / companies.length;
  period.averagePeriodUsingPower = period.averagePeriodUsingPower / companies.length;

  for (let player of companies) {
    const companyData: Company = player.companyPeriods[currentPeriod];

    if (period.totalBuyers > 0) {
      companyData.marketingPart = companyData.receivedOrders / period.totalBuyers * 100.;
    }

    const companiesAmount = companies.length;
    const ratingByAccumulatedProfit =
      (35 * companyData.accumulatedProfit / ((currentPeriod + 1) * companyData.initialAccumulatedProfit));

    const ratingByDemand = (companyData.sumMarketing + companyData.sumNir)
      / (period.summaryMarketing + period.summaryNir)
      * companiesAmount * 10.;

    const ratingBySupply = (companyData.sumProduction / period.summaryProduction) * companiesAmount * 10.;

    const ratingByEfficiency = (1. - Math.abs(companyData.usingPower - 80.) / 100.) * 10.;

    const ratingByMarketingPart = Math.min(
      (companyData.receivedOrders / period.totalBuyers * companiesAmount * 10.),
      20.
    );

    const sales: number = companyData.sales;
    const ratingByGrow: number = Math.min(
      (sales === 0 ? 0. : 10.) * sales / player.companyPeriods[currentPeriod - 1].sales
        / period.totalSales * previousPeriod.totalSales,
      20.
    );
    server.logger().info(`Rating parts:
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

    server.logger().info(`Game ${game.name}[${game.id}] {${game.currentPeriod}}:: player ${player.userName}[${player.id}] rating: ${companyData.rating}`);
  }
  return em.save(period);
};

export default calculateGame;
