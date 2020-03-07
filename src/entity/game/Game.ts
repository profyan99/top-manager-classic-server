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
  })
  state: GameState;

  @Column()
  maxPeriods: number;

  @Column()
  currentPeriod: number;

  @ManyToOne(type => Scenario)
  scenario: Scenario;

  @OneToMany(type => Player, player => player.game)
  players: Player[];

  @Column(type => GamePeriod)
  periods: GamePeriod[];

  currentSecond: number;

  isSendSolutionsAllowed: boolean;

  playersSolutionsAmount: boolean;

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
