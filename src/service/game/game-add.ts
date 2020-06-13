import { getManager } from 'typeorm';

import { Game } from '../../entity/game/Game';
import { GamePeriod } from '../../entity/game/GamePeriod';

const addGame = async payload => {
  return getManager().transaction(async em => {
    payload.startCountDownTime = Date.now();

    const game: Game = new Game(payload);
    game.currentPeriod = 0;

    const initialGamePeriod: GamePeriod = new GamePeriod();
    initialGamePeriod.period = 0;
    await em.save(initialGamePeriod);

    game.periods = [];
    game.periods.push(initialGamePeriod);
    return em.save(game);
  });
};

export default addGame;
