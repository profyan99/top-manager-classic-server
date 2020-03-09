import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Scenario} from "./Scenario";
import {GameState} from "./GameState";
import {Player} from "../player/Player";
import {GamePeriod} from "./GamePeriod";

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  maxPlayers: number;

  @Column({ nullable: true })
  password: string;

  @Column({ default: false })
  tournament: boolean;

  @Column()
  periodDuration: number;

  @Column({
    type: "enum",
    enum: GameState,
    default: GameState.PREPARE,
  })
  state: GameState;

  @Column()
  maxPeriods: number;

  @Column({ default: 0 })
  currentPeriod: number;

  @ManyToOne(type => Scenario)
  scenario: Scenario;

  @OneToMany(type => Player, player => player.game)
  players: Player[];

  @OneToMany(type => GamePeriod, gamePeriod => gamePeriod.game)
  periods: GamePeriod[];

  @Column({ default: 0 })
  currentSecond: number;

  @Column({ default: false })
  isSendSolutionsAllowed: boolean;

  @Column({ default: 0 })
  playersSolutionsAmount: number;

  public constructor(props: GameProps) {
    Object.assign(this, props);
  }
}

export interface GameProps {
  name: string;
  maxPlayers: number;
  maxPeriods: number;
  password?: string;
  tournament?: boolean;
  periodDuration: number;
  scenario: Scenario;
}
