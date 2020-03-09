import {EntityRepository, Repository} from "typeorm";

import {Player} from "../entity/player/Player";

@EntityRepository(Player)
export class PlayerRepository extends Repository<Player> {
  findOneFullByUserName(userName: string) {
    return this.findOne({
      where: {
        userName,
      },
      relations: [
        'companyPeriods',
      ],
    })
  }
}
