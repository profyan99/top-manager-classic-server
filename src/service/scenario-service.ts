import * as Boom from '@hapi/boom';
import { getRepository, Repository } from 'typeorm';

import { Scenario } from '../entity/game/Scenario';
import ScenarioMapper from '../mapper/scenario-mapper';
import { User } from '../entity/user/User';
import { ERRORS } from '../utils/errors';
import logger from '../logging';

export const getScenarios = async () => {
  return (await getRepository(Scenario).find())
    .map((scenario) => ScenarioMapper.map(scenario));
};

export const addScenario = async (user: User, payload) => {
  const scenarioRepository: Repository<Scenario> = getRepository(Scenario);

  if (await scenarioRepository.findOne({ where: { name: payload.name } })) {
    throw Boom.badRequest(ERRORS.SCENARIO.EXISTED);
  }

  const scenario: Scenario = new Scenario(payload);
  await scenarioRepository.save(scenario);
  logger.info(`New scenario ${scenario.name} was added by ${user.userName}`);
  return ScenarioMapper.map(scenario);
};

export default {
  getScenarios,
  addScenario,
};
