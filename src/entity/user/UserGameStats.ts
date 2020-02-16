import {Column, Entity} from "typeorm";

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
  maxRIF: number;

  @Column()
  hoursInGame: number;

  @Column()
  leaveGameAmount: number;

  @Column()
  complainAmount: number;
}
