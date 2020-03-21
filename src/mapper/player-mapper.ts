import {Player} from "../entity/player/Player";

const mapPreviewByPeriod = (player: Player, period: number) => ({
  id: player.id,
  state: player.state,
  userName: player.userName,
  companyName: player.companyName,
  stats: {
    rating: player.companyPeriods[period].rating,
    price: player.companyPeriods[period].price,
    revenue: player.companyPeriods[period].revenue,
    netProfit: player.companyPeriods[period].netProfit,
    accumulatedProfit: player.companyPeriods[period].accumulatedProfit,
    marketingPart: player.companyPeriods[period].marketingPart,
  },
});

const mapFullByPeriod = (player: Player, period: number) => {
  const company = player.companyPeriods[period];
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
  }
};

const currentPeriod = (player) => (player.companyPeriods && (player.companyPeriods.length - 1)) || 0;

export default {
  mapFullByPeriod,
  mapFull: (player: Player) => mapFullByPeriod(player, currentPeriod(player)),
  mapPreviewByPeriod,
  mapPreview: (player: Player) => mapPreviewByPeriod(player, currentPeriod(player)),
};
