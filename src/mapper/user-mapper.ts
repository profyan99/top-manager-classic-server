import { User } from '../entity/user/User';

export const mapUser = (user: User) => ({
  id: user.id,
  userName: user.userName,
  avatar: user.avatar,
  roles: user.roles,
  gameStats: user.gameStats,
});

export default mapUser;
