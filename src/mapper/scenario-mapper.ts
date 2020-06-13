import { Scenario } from '../entity/game/Scenario';

export default {
  map: (scenario: Scenario) => ({
    id: scenario.id,
    name: scenario.name,
    description: scenario.description,
  }),
};
