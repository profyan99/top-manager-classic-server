import {Game} from '../entity/game/Game';
import ScenarioMapper from './scenario-mapper';
import PlayerMapper from './player-mapper';

const mapPreview = (game: Game) => ({
  id: game.id,
  name: game.name,
  maxPlayers: game.maxPlayers,
  maxPeriods: game.maxPeriods,
  currentPlayers: game.players.length,
  locked: !!game.password,
  tournament: game.tournament,
  scenario: ScenarioMapper.map(game.scenario),
  state: game.state,
  currentPeriod: game.currentPeriod,
});

export default {
  mapPreview,
  mapFull: (game: Game) => ({
    ...mapPreview(game),
    currentSecond: game.currentSecond,
    players: game.players.map((player) => PlayerMapper.mapPreview(player)),
  }),
};
