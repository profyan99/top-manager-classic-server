import * as Boom from '@hapi/boom';
import * as Iron from '@hapi/iron';

import {User} from "../entity/user/User";
import {UserRole} from "../entity/user/UserRole";
import {getCustomRepository, getManager, getRepository} from "typeorm";
import {UserRepository} from "../repository/user-repository";
import {UserGameStats} from "../entity/user/UserGameStats";
import * as JWT from "jsonwebtoken";

const getCurrentUser = (user: User) => {
  return {
    id: user.id,
    userName: user.userName,
    avatar: user.avatar,
    roles: user.roles,
    gameStats: user.gameStats,
  };
};

const getUserById = (id: number): Promise<User> => {
  return getRepository(User).findOne({where: {id}});
};

const getUserByUserName = (userName: string): Promise<User> => {
  return getRepository(User).findOne({where: {userName}});
};

const getUserByRefreshToken = (refreshToken: string): Promise<User> => {
  return getRepository(User).findOne({ where: { refreshToken } });
};

const generateJWT = (user: User) => {
  return JWT.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRATION_TIME});
};

const generateRefreshToken = () => {
  return JWT.sign({}, process.env.JWT_REFRESH_TOKEN_SECRET);
};

const addUser = async (request, {userName, email, password, avatar}) => {
  return await getManager().transaction(async em => {
    const userRepository: UserRepository = em.getCustomRepository(UserRepository);

    if (await userRepository.findOne({where: {userName}})) {
      throw Boom.badRequest('Пользователь с таким никнеймом уже существует.');
    }

    if (await userRepository.findOne({where: {email}})) {
      throw Boom.badRequest('Пользователь с таким email адресом уже существует.');
    }

    const encryptedPassword = password ? await Iron.seal(password, process.env.PASSWORD_SALT, Iron.defaults) : password;
    const user: User = new User({
      email: email,
      userName: userName,
      avatar: avatar,
      password: encryptedPassword,
      ip: request.headers['x-forwarded-for'] || request.info.remoteAddress || '',
      lastLogIn: new Date(),
      roles: [UserRole.PLAYER, UserRole.UNVERIFIED],
      gameStats: new UserGameStats(),
      socialUser: password.length === 0,
      refreshToken: generateRefreshToken(),
    });
    await userRepository.save(user);
    return user;
  });
};

const loginUserThrowSocial = async (request, data: { userName; email; password; avatar }) => {
  const userRepository: UserRepository = getCustomRepository(UserRepository);

  let user: User = await getUserByUserName(data.userName);
  if(!user) {
    user = await addUser(request, data);
  }

  user.lastLogIn = new Date();
  await userRepository.save(user);

  return {
    accessToken: generateJWT(user),
    refreshToken: user.refreshToken,
  };
};

const loginUser = async ({userName, password}) => {
  const userRepository: UserRepository = getCustomRepository(UserRepository);
  const loginError = 'Неверный никнейм или пароль.';

  const user: User = await userRepository.findOne({where: {userName}})
    .catch(() => {
      throw Boom.badRequest(loginError);
    });

  if (!user) {
    throw Boom.badRequest(loginError);
  }

  if (user.socialUser) {
    throw Boom.badRequest('Аккаунт зарегистрирован через социальные сети');
  }

  if (await Iron.seal(password, process.env.PASSWORD_SALT, Iron.defaults) !== user.password) {
    throw Boom.badRequest(loginError);
  }

  user.lastLogIn = new Date();
  await userRepository.save(user);

  return {
    accessToken: generateJWT(user),
    refreshToken: user.refreshToken,
  };

};

export default {
  addUser,
  getCurrentUser,
  getUserById,
  getUserByUserName,
  loginUser,
  generateJWT,
  loginUserThrowSocial,
  getUserByRefreshToken,
}
