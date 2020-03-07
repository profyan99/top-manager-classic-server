import {Column} from "typeorm";

export class Company {

  @Column()
  period: number;

  @Column()
  receivedOrders: number;
  @Column()
  machineTools: number;
  @Column()
  storage: number;
  @Column()
  storageCost: number;
  @Column()
  sales: number;
  @Column()
  backlogSales: number;

  @Column()
  price: number;
  @Column()
  production: number;
  @Column()
  marketing: number;
  @Column()
  investments: number;
  @Column()
  nir: number;

  @Column()
  bank: number;
  @Column()
  loan: number;
  @Column()
  activeStorage: number;
  @Column()
  kapInvests: number;
  @Column()
  sumActives: number;

  @Column()
  revenue: number;
  @Column()
  SPPT: number;
  @Column()
  bankInterest: number;
  @Column()
  grossIncome: number;
  @Column()
  profitTax: number;
  @Column()
  tax: number;
  @Column()
  netProfit: number;
  @Column()
  accumulatedProfit: number;
  @Column()
  initialAccumulatedProfit: number;
  @Column()
  marketingPart: number;

  @Column()
  futurePower: number;
  @Column()
  fullPower: number;
  @Column()
  usingPower: number;
  @Column()
  amortization: number;
  @Column()
  additionalInvestments: number;

  @Column()
  productionCost: number;
  @Column()
  productionCostAll: number;

  @Column()
  sumMarketing: number;
  @Column()
  sumNir: number;
  @Column()
  sumProduction: number;
  @Column()
  rating: number;

  maxPredictedSales: number;
  maxPredictedRevenue: number;

  shareEffectMk: number;
  shareEffectRd: number;
  shareEffectPr: number;

}
