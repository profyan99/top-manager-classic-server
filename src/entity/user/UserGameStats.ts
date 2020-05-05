import {Column} from "typeorm";

export class UserGameStats {
  @Column()
  gamesAmount: number;

  @Column()
  winAmount: number;

  @Column()
  loseAmount: number;

  @Column()
  tournamentAmount: number;

  @Column()
  maxRevenue: number;

  @Column()
  maxRating: number;

  @Column()
  hoursInGame: number;

  @Column()
  leaveGameAmount: number;

  @Column()
  complainAmount: number;

  constructor() {
    this.gamesAmount = 0;
    this.winAmount = 0;
    this.loseAmount = 0;
    this.tournamentAmount = 0;
    this.maxRevenue = 0;
    this.maxRating = 0;
    this.hoursInGame = 0;
    this.leaveGameAmount = 0;
    this.complainAmount = 0;
  }

}
