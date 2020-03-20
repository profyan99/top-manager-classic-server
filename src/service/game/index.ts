import addGame from "./game-add";
import calculateGame from "./game-calculation";
import handleNewPeriod from './game-handle-period';
import removeGame from "./game-remove";
import removeInactivePlayers from "./game-remove-players";
import updateGame from "./game-update";

export default {
  addGame,
  removeGame,
  updateGame,
  calculateGame,
  handleNewPeriod,
  removeInactivePlayers,
}
