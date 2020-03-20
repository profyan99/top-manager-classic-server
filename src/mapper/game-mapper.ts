import {Game} from '../entity/game/Game';
import ScenarioMapper from './scenario-mapper';
import PlayerMapper from './player-mapper';

const mapPreview = (game: Game) => ({
  id: game.id,
  name: game.name,
  maxPlayers: game.maxPlayers,
  maxPeriods: game.maxPeriods,
  currentPlayers: (game.players && game.players.length) || 0,
  locked: !!game.password,
  tournament: game.tournament,
  scenario: ScenarioMapper.map(game.scenario),
  state: game.state,
  currentPeriod: game.currentPeriod,
  players: (game.players && game.players.map((player) => player.userName)) || [],
});

export default {
  mapPreview,
  mapFull: (game: Game) => ({
    ...mapPreview(game),
    startCountDownTime: game.startCountDownTime,
    players: game.players.map((player) => PlayerMapper.mapPreview(player)),
  }),
};
