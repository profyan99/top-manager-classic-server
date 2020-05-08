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
        'owner',
        'players',
        'players.companyPeriods',
        'players.user',
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
        'owner',
        'players',
        'players.user',
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
        'owner',
        'players',
        'players.companyPeriods',
        'players.user',
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
        'owner',
        'players',
        'players.companyPeriods',
        'players.user',
        'scenario',
        'periods',
      ],
    });
  }
}
