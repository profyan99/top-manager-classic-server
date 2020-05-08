import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Scenario} from "./Scenario";
import {GameState} from "./GameState";
import {Player} from "../player/Player";
import {GamePeriod} from "./GamePeriod";
import { User } from '../user/User';

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

  @ManyToOne(type => User)
  owner: User;

  @Column({ type: 'bigint' })
  startCountDownTime: number;

  @Column({ default: false })
  isSendSolutionsAllowed: boolean;

  @Column({ default: 0 })
  playersSolutionsAmount: number;

  @Column({ default: false })
  isRemoved: boolean;

  public constructor(props: GameProps) {
    Object.assign(this, props);
  }

  public getBankruptCount(): number {
    return this.players.filter((player) => player.isBankrupt).length;
  }

  public getActualPlayers(): Player[] {
    return this.players.filter((player) => !player.isRemoved && !player.isBankrupt);
  }

  public getConnectedPlayers(): Player[] {
    return this.players.filter((player) => player.isConnected);
  }

  public getExistedPlayers(): Player[] {
    return this.players.filter((player) => !player.isRemoved);
  }

  public isAllSendSolutions(): boolean {
    return this.playersSolutionsAmount + this.getBankruptCount() >= this.players.length;
  }
}

export interface GameProps {
  name: string;
  maxPlayers: number;
  maxPeriods: number;
  password?: string;
  tournament?: boolean;
  periodDuration: number;
  startCountDownTime: number;
  scenario: Scenario;
}
