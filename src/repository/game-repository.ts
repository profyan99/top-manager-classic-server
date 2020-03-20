import {EntityRepository, Repository} from "typeorm";

import {Game} from "../entity/game/Game";

@EntityRepository(Game)
export class GameRepository extends Repository<Game> {

  findWithoutPeriods() {
    return this.find({
      where: {
        isRemoved: false,
      },
      relations: [
        'players',
        'players.companyPeriods',
        'scenario',
      ],
    });
  }

  findWithPlayers() {
    return this.find({
      where: {
        isRemoved: false,
      },
      relations: [
        'players',
      ],
    });
  }

  findOneWithoutPeriods(gameId: number) {
    return this.findOne({
      where: {
        isRemoved: false,
        id: gameId,
      },
      relations: [
        'players',
        'players.companyPeriods',
        'scenario',
      ],
    });
  }

  findOneFull(gameId: number) {
    return this.findOne({
      where: {
        isRemoved: false,
        id: gameId,
      },
      relations: [
        'players',
        'players.companyPeriods',
        'scenario',
        'periods',
      ],
    });
  }
}
