import { Player } from '../../entity/player/Player';
import { Company } from '../../entity/player/Company';
import { EntityManager } from 'typeorm';
import { Game } from '../../entity/game/Game';

const addNewCompany = async (game: Game, player: Player, em: EntityManager) => {
  const companyRepository = em.getRepository(Company);
  const newCompany = new Company();
  newCompany.period = game.currentPeriod;
  newCompany.player = player;
  return companyRepository.save(newCompany);
};

export default addNewCompany;
