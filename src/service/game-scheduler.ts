import * as Cron from 'cron';

import { updateGames } from './game-service';

const start = () => {
  Cron.job(process.env.GAME_SCHEDULER_CRON, updateGames, null, true);
};

export default start;
