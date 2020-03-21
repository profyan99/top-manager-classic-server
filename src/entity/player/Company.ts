import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Player } from "./Player";

@Entity()
export class Company {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  period: number;

  @Column({ default: 0 })
  receivedOrders: number;
  @Column({ default: 0 })
  machineTools: number;
  @Column({ default: 0 })
  storage: number;
  @Column({ default: 0, type: 'real' })
  storageCost: number;
  @Column({ default: 0 })
  sales: number;
  @Column({ default: 0 })
  backlogSales: number;

  @Column({ default: 0 })
  price: number;
  @Column({ default: 0 })
  production: number;
  @Column({ default: 0 })
  marketing: number;
  @Column({ default: 0 })
  investments: number;
  @Column({ default: 0 })
  nir: number;

  @Column({ default: 0 })
  bank: number;
  @Column({ default: 0 })
  loan: number;
  @Column({ default: 0 })
  activeStorage: number;
  @Column({ default: 0 })
  kapInvests: number;
  @Column({ default: 0 })
  sumActives: number;

  @Column({ default: 0 })
  revenue: number;
  @Column({ default: 0 })
  SPPT: number;
  @Column({ default: 0 })
  bankInterest: number;
  @Column({ default: 0 })
  grossIncome: number;
  @Column({ default: 0 })
  profitTax: number;
  @Column({ default: 0 })
  tax: number;
  @Column({ default: 0 })
  netProfit: number;
  @Column({ default: 0 })
  accumulatedProfit: number;
  @Column({ default: 0 })
  initialAccumulatedProfit: number;
  @Column({ default: 0, type: 'real' })
  marketingPart: number;

  @Column({ default: 0 })
  futurePower: number;
  @Column({ default: 0 })
  fullPower: number;
  @Column({ default: 0, type: 'real' })
  usingPower: number;
  @Column({ default: 0 })
  amortization: number;
  @Column({ default: 0 })
  additionalInvestments: number;

  @Column({ default: 0, type: 'real' })
  productionCost: number;
  @Column({ default: 0, type: 'real' })
  productionCostAll: number;

  @Column({ default: 0, type: 'real' })
  sumMarketing: number;
  @Column({ default: 0, type: 'real' })
  sumNir: number;
  @Column({ default: 0, type: 'real' })
  sumProduction: number;
  @Column({ default: 0 })
  rating: number;

  maxPredictedSales: number;
  maxPredictedRevenue: number;

  shareEffectMk: number;
  shareEffectRd: number;
  shareEffectPr: number;

  @ManyToOne(type => Player, player => player.companyPeriods,
    { onDelete: 'CASCADE' })
  player: Player;

}
