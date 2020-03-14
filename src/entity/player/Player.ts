import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {PlayerState} from "./PlayerState";
import {User} from "../user/User";
import {Game} from "../game/Game";
import {Company} from "./Company";

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userName: string;

  @Column()
  companyName: string;

  @Column({
    type: "enum",
    enum: PlayerState,
    default: PlayerState.WAIT,
  })
  state: PlayerState;

  @Column({ default: false })
  isBankrupt: boolean;

  @Column({ default: 0 })
  timeToEndReload: number;

  @Column({ default: true })
  isConnected: boolean;

  @OneToOne(type => User)
  @JoinColumn()
  user: User;

  @ManyToOne(type => Game, game => game.players)
  game: Game;

  @OneToMany(type => Company, company => company.player)
  companyPeriods: Company[];

}
