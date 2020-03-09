import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Game} from "./Game";

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
  @Column({ default: 0 })
  totalMarketing: number;
  @Column({ default: 0 })
  totalPrice: number;
  @Column({ default: 0 })
  totalBuyers: number;
  @Column({ default: 0 })
  totalSales: number;


  @Column({ default: 0 })
  summaryPeriodPower: number;
  @Column({ default: 0 })
  summaryPeriodProduction: number;
  @Column({ default: 0 })
  summaryPeriodMarketing: number;
  @Column({ default: 0 })
  summaryPeriodSales: number;
  @Column({ default: 0 })
  summaryPeriodStorage: number;
  @Column({ default: 0 })
  summaryPeriodRevenue: number;
  @Column({ default: 0 })
  summaryPeriodKapInvests: number;
  @Column({ default: 0 })
  averagePeriodPrice: number;
  @Column({ default: 0 })
  averagePeriodProductionCost: number;
  @Column({ default: 0 })
  averagePeriodUsingPower: number;

  @ManyToOne(type => Game, game => game.periods)
  game: Game;
}
