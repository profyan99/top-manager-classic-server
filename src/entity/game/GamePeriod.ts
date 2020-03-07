import {Column} from "typeorm";

export class GamePeriod {

  @Column()
  period: number;
  @Column()
  summaryMarketing: number;
  @Column()
  summaryNir: number;
  @Column()
  summaryProduction: number;
  @Column()
  totalMarketing: number;
  @Column()
  totalPrice: number;
  @Column()
  totalBuyers: number;
  @Column()
  totalSales: number;


  @Column()
  summaryPeriodPower: number;
  @Column()
  summaryPeriodProduction: number;
  @Column()
  summaryPeriodMarketing: number;
  @Column()
  summaryPeriodSales: number;
  @Column()
  summaryPeriodStorage: number;
  @Column()
  summaryPeriodRevenue: number;
  @Column()
  summaryPeriodKapInvests: number;
  @Column()
  averagePeriodPrice: number;
  @Column()
  averagePeriodProductionCost: number;
  @Column()
  averagePeriodUsingPower: number;
}
