import { EntityRepository, Repository } from 'typeorm';

import {Player} from "../entity/player/Player";

@EntityRepository(Player)
export class PlayerRepository extends Repository<Player> {
  findOneFullByUserNameAndGame(userName: string, gameId: number) {
    return this.findOne({
      where: {
        userName,
        isRemoved: false,
        game: {
          id: gameId,
        },
      },
      relations: [
        'companyPeriods',
        'game',
        'user',
      ],
    });
  }

  findOneWithoutPeriods(userName: string, gameId: number) {
    return this.findOne({
      where: {
        userName,
        isRemoved: false,
        game: {
          id: gameId,
        },
      },
      relations: [
        'game',
        'user',
      ],
    });
  }

}
