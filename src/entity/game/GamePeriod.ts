import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Game } from './Game';

@Entity()
export class GamePeriod {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ default: 0 })
  period: number;
  @Column({ default: 0 })
  summaryMarketing: number;
  @Column({ default: 0 })
  summaryNir: number;
  @Column({ default: 0 })
  summaryProduction: number;
  @Column({ default: 0, type: 'real' })
  totalMarketing: number;
  @Column({ default: 0, type: 'real' })
  totalPrice: number;
  @Column({ default: 0 })
  totalBuyers: number;
  @Column({ default: 0 })
  totalSales: number;

  @Column({ default: 0, type: 'real' })
  summaryPeriodPower: number;
  @Column({ default: 0, type: 'real' })
  summaryPeriodProduction: number;
  @Column({ default: 0, type: 'real' })
  summaryPeriodMarketing: number;
  @Column({ default: 0, type: 'real' })
  summaryPeriodSales: number;
  @Column({ default: 0, type: 'real' })
  summaryPeriodStorage: number;
  @Column({ default: 0, type: 'real' })
  summaryPeriodRevenue: number;
  @Column({ default: 0, type: 'real' })
  summaryPeriodKapInvests: number;
  @Column({ default: 0, type: 'real' })
  averagePeriodPrice: number;
  @Column({ default: 0, type: 'real' })
  averagePeriodProductionCost: number;
  @Column({ default: 0, type: 'real' })
  averagePeriodUsingPower: number;

  @ManyToOne(
    () => Game,
    game => game.periods,
  )
  game: Game;

  constructor() {
    this.period = 0;
    this.summaryMarketing = 0;
    this.summaryNir = 0;
    this.summaryProduction = 0;
    this.totalMarketing = 0;
    this.totalPrice = 0;
    this.totalBuyers = 0;
    this.totalSales = 0;

    this.summaryPeriodPower = 0;
    this.summaryPeriodProduction = 0;
    this.summaryPeriodMarketing = 0;
    this.summaryPeriodSales = 0;
    this.summaryPeriodStorage = 0;
    this.summaryPeriodRevenue = 0;
    this.summaryPeriodKapInvests = 0;
    this.averagePeriodPrice = 0;
    this.averagePeriodProductionCost = 0;
    this.averagePeriodUsingPower = 0;
  }
}
