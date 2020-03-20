import { EntityManager } from "typeorm";

import { Player } from "../../entity/player/Player";
import { addPlayerLeaveGame } from "../user-service";
import { server } from "../../index";

const removeInactivePlayers = async (players: Player[], currentTime: number, gameId: number, em: EntityManager) => {
  const playerRepository = em.getRepository(Player);
  const removedPlayers = players
    .filter((player) => !player.isConnected && player.timeToEndReload && player.timeToEndReload < currentTime)
    .map((player) => [playerRepository.remove(player), addPlayerLeaveGame(player.user)]); // TODO give em

  if (removedPlayers.length) {
    server.logger().info(`Game ${gameId}: removed [${removedPlayers.length}] inactive players`);
  }
  await Promise.all(removedPlayers);
};

export default removeInactivePlayers;
