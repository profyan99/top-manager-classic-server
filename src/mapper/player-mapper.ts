import { Player } from '../entity/player/Player';

const mapPreviewByPeriod = (player: Player, period: number) => {
  const company = player.getCompanyByPeriod(period);
  return {
    id: player.id,
    state: player.state,
    userName: player.userName,
    companyName: player.companyName,
    isBankrupt: player.isBankrupt,
    stats: {
      rating: company.rating,
      price: company.price,
      revenue: company.revenue,
      netProfit: company.netProfit,
      accumulatedProfit: company.accumulatedProfit,
      marketingPart: company.marketingPart,
    },
  };
};

const mapFullByPeriod = (player: Player, period: number) => {
  const company = player.getCompanyByPeriod(period);
  return {
    ...mapPreviewByPeriod(player, period),
    company: {
      period: company.period,
      receivedOrders: company.receivedOrders,
      machineTools: company.machineTools,
      storage: company.storage,
      storageCost: company.storageCost,
      sales: company.sales,
      backlogSales: company.backlogSales,

      bank: company.bank,
      loan: company.loan,
      activeStorage: company.activeStorage,
      kapInvests: company.kapInvests,
      sumActives: company.sumActives,

      revenue: company.revenue,
      SPPT: company.SPPT,
      bankInterest: company.bankInterest,
      grossIncome: company.grossIncome,
      profitTax: company.profitTax,
      tax: company.tax,
      netProfit: company.netProfit,

      futurePower: company.futurePower,
      fullPower: company.fullPower,
      usingPower: company.usingPower,
      amortization: company.amortization,
      additionalInvestments: company.additionalInvestments,

      productionCost: company.productionCost,
    },
    solutions: {
      price: company.price,
      production: company.production,
      marketing: company.marketing,
      investments: company.investments,
      nir: company.nir,
    },
  };
};

export default {
  mapFullByPeriod,
  mapPreviewByPeriod,
};
