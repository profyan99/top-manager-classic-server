import { Game } from "../../entity/game/Game";
import { getManager } from "typeorm";
import { GamePeriod } from "../../entity/game/GamePeriod";

const addGame = async (payload) => {
  return getManager().transaction(async (em) => {
    const game: Game = new Game(payload);
    game.currentPeriod = 1;

    const initialGamePeriod: GamePeriod = new GamePeriod();
    initialGamePeriod.period = 0;
    await em.save(initialGamePeriod);

    game.periods = [];
    game.periods.push(initialGamePeriod);
    return em.save(game);
  });
};

export default addGame;
