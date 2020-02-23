import * as Hapi from '@hapi/hapi';
import * as Boom from '@hapi/boom';

import UserService from '../service/user-service';
import AuthValidator from "./validator/auth-validator";
import {User} from "../entity/user/User";

interface UserData {
  userName: string;
  email: string;
  password: string;
  avatar: string;
}

const socialAuthHandler = async (request, h, mapUserData: ((data) => UserData)) => {
  if (!request.auth.isAuthenticated) {
    return Boom.unauthorized(`Authentication failed due to: ${request.auth.error.message}`);
  }

  const userProfile = request.auth.credentials['profile'];
  const data: UserData = mapUserData(userProfile);

  const {accessToken, refreshToken} = await UserService.loginUserThrowSocial(request, data);
  const startUrlIndex = request.query.state.indexOf('http');
  return h.redirect(
    (request.query.state as string).substring(startUrlIndex) +
    '?access_token=' + accessToken +
    '&refresh_token=' + refreshToken
  );
};

const googleAuthRoute: Hapi.ServerRoute = {
  method: ['GET', 'POST'],
  path: '/auth/google',
  async handler(request, h) {
    return socialAuthHandler(request, h, (userProfile) => ({
      userName: userProfile.displayName,
      email: userProfile.email,
      password: '',
      avatar: userProfile.raw.picture,
    }));
  },
  options: {
    auth: {
      strategy: 'google',
      mode: 'try'
    },
  },
};

const vkAuthRoute: Hapi.ServerRoute = {
  method: ['GET', 'POST'],
  path: '/auth/vk',
  async handler(request, h) {
    return socialAuthHandler(request, h, (userProfile) => ({
      userName: userProfile.displayName,
      email: '',
      password: '',
      avatar: userProfile.raw.photo_100,
    }));
  },
  options: {
    auth: {
      strategy: 'VK',
      mode: 'try'
    },
  },
};

const refreshToken = {
  method: ['POST'],
  path: '/auth/token',
  async handler(request, h) {
    const {refreshToken} = request.payload;
    const user: User = await UserService.getUserByRefreshToken(refreshToken);
    if(!user) {
      throw Boom.badRequest('Неверный refreshToken.');
    }
    return {
      accessToken: UserService.generateJWT(user),
      refreshToken,
    }
  },
  options: {
    auth: false,
    validate: {
      payload: AuthValidator.refreshToken,
    },
  },
};

export default [
  googleAuthRoute,
  vkAuthRoute,
  refreshToken,
];
