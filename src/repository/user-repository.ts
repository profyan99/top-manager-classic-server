import {EntityRepository, Repository} from "typeorm";
import {User} from "../entity/user/User";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  disconnectAll() {
    return this
      .createQueryBuilder()
      .update(User)
      .set({ isConnected: false })
      .execute();
  }
}
