import {Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
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
  })
  state: PlayerState;

  @Column()
  isBankrupt: boolean;

  @Column()
  timeToEndReload: number;

  @OneToOne(type => User)
  @JoinColumn()
  user: User;

  @ManyToOne(type => Game, game => game.players)
  game: Game;

  @Column(type => Company)
  companyPeriods: Company[];

}
