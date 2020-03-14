import {EntityRepository, Repository} from "typeorm";

import {Game} from "../entity/game/Game";

@EntityRepository(Game)
export class GameRepository extends Repository<Game> {

  findWithoutPeriods(isCached?: boolean) {
    return this.find({
      where: {
        isRemoved: false,
      },
      relations: [
        'players',
        'players.companyPeriods',
        'scenario',
      ],
      cache: isCached ? 60_000 : 1000,
    });
  }

  findOneWithoutPeriods(gameId: number) {
    return this.findOne({
      where: {
        id: gameId,
      },
      relations: [
        'players',
        'players.companyPeriods',
        'scenario',
      ],
    });
  }
}
