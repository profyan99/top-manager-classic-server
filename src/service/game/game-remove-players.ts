import { EntityManager } from "typeorm";

import { addPlayerLeaveGame } from "../user-service";
import { server } from "../../index";
import { PlayerRepository } from "../../repository/player-repository";
import { Game } from '../../entity/game/Game';

const removeInactivePlayers = async (game: Game, currentTime: number, em: EntityManager) => {
  const playerRepository = em.getCustomRepository(PlayerRepository);
  const removedPlayers = game.players
    .filter((player) => !player.isConnected && player.timeToEndReload && player.timeToEndReload < currentTime)
    .map((player) => {
      game.players = game.players.filter((gamePlayer) => gamePlayer.id !== player.id);
      return[
        playerRepository.remove(player),
        addPlayerLeaveGame(player.user, em)
      ];
    });

  if (removedPlayers.length) {
    server.logger().info(`Game ${game.id}: removed [${removedPlayers.length}] inactive players`);
  }
  await Promise.all(removedPlayers);
};

export default removeInactivePlayers;
