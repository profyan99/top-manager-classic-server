import {EntityRepository, Repository} from "typeorm";

import {Game} from "../entity/game/Game";

@EntityRepository(Game)
export class GameRepository extends Repository<Game> {

  findWithoutPeriods() {
    return this.find({
      relations: [
        'players',
        'scenario',
      ],
    });
  }

  findOneWithoutPeriods(gameId: number) {
    return this.findOne({
      relations: [
        'players',
        'scenario',
      ],
    });
  }
}
