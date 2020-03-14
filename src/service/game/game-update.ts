import { getRepository } from "typeorm";

import { Game } from "../../entity/game/Game";
import { GameState } from "../../entity/game/GameState";
import { handleNewPeriod } from "./game-handle-period";
import { Player } from "../../entity/player/Player";
import { addPlayerLeaveGame } from "../user-service";
import { broadcastGameTickEvent } from "../game-message-sender-service";

const removeInactivePlayers = async (players: Player[]) => {
  const playerRepository = getRepository(Player);
  const currentTime = Date.now();
  const removedPlayers = players
    .filter((player) => !player.isConnected && player.timeToEndReload && player.timeToEndReload < currentTime)
    .map((player) => [playerRepository.remove(player), addPlayerLeaveGame(player.user)]);

  await Promise.all(removedPlayers);
};

const updateGame = async (game: Game) => {
  const currentTime = Date.now();
  const timeDiff = Math.round((currentTime - game.startCountDownTime) / 1000);

  if (game.state !== GameState.END) {
    broadcastGameTickEvent(game, timeDiff);
  }

  if (timeDiff >= game.periodDuration && game.state === GameState.PLAY) {
    await removeInactivePlayers(game.players);
    await handleNewPeriod(game);
  }
};

export default updateGame;
