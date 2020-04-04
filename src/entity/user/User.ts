import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from "typeorm";
import {UserRole} from "./UserRole";
import {UserGameStats} from "./UserGameStats";

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({unique: true})
  userName: string;

  @Column()
  ip: string;

  @CreateDateColumn({type: 'date'})
  registerDate: string;

  @Column()
  lastLogIn: Date;

  @Column()
  password: string;

  @Column()
  refreshToken: string;

  @Column()
  avatar: string;

  @Column({default: false})
  socialUser: boolean;

  @Column({
    type: "enum",
    enum: UserRole,
    array: true,
  })
  roles: UserRole[];

  @Column(type => UserGameStats)
  gameStats: UserGameStats;

  @Column({ default: true })
  isConnected: boolean;

  constructor(data?: { email; userName; ip; lastLogIn; password; avatar; roles; gameStats; socialUser; refreshToken }) {
    if (data) {
      this.email = data.email;
      this.userName = data.userName;
      this.ip = data.ip;
      this.lastLogIn = data.lastLogIn;
      this.password = data.password;
      this.avatar = data.avatar;
      this.roles = data.roles;
      this.gameStats = data.gameStats;
      this.socialUser = data.socialUser;
      this.refreshToken = data.refreshToken;
      this.isConnected = true;
    }
  }
}
