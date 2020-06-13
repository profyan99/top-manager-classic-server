import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { PlayerState } from './PlayerState';
import { User } from '../user/User';
import { Game } from '../game/Game';
import { Company } from './Company';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userName: string;

  @Column()
  companyName: string;

  @Column({
    type: 'enum',
    enum: PlayerState,
    default: PlayerState.WAIT,
  })
  state: PlayerState;

  @Column({ default: false })
  isBankrupt: boolean;

  @Column({ default: 0, type: 'bigint' })
  timeToEndReload: number;

  @Column({ default: false })
  isConnected: boolean;

  @Column({ default: false })
  isRemoved: boolean;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(
    () => Game,
    game => game.players,
  )
  game: Game;

  @OneToMany(
    () => Company,
    company => company.player,
  )
  companyPeriods: Company[];

  public constructor(props?) {
    if (props) {
      Object.assign(this, props);
    }
  }

  public getCompanyByPeriod(period: number) {
    return this.companyPeriods.find(company => company.period === period);
  }
}
