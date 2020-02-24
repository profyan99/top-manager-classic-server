import * as Hapi from '@hapi/hapi';

import authValidation from './auth-validation';
import authRoutes from '../route/auth-routes';
import {ServerRoute} from "@hapi/hapi";

const register = async (server: Hapi.Server) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  await server.register(require('@hapi/bell'));
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  await server.register(require('hapi-auth-jwt2'));

  server.auth.strategy('google', 'bell', {
    provider: 'google',
    password: process.env.GOOGLE_COOKIE_PASSWORD,
    isSecure: process.env.NODE_ENV === 'production',
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    location: process.env.GOOGLE_API_LOCATION,
    providerParams: {
      // eslint-disable-next-line @typescript-eslint/camelcase
      access_type: 'offline',
    },
    runtimeStateCallback(request) {
      return request.headers.referer;
    },
  });

  server.auth.strategy('VK', 'bell', {
    provider: 'vk',
    password: process.env.VK_COOKIE_PASSWORD,
    isSecure: process.env.NODE_ENV === 'production',
    clientId: process.env.VK_CLIENT_ID,
    clientSecret: process.env.VK_SECRET,
    location: process.env.VK_API_LOCATION,
    profileParams: {
      fields: 'photo_100',
    },
    runtimeStateCallback(request) {
      return request.headers.referer;
    },
  });

  server.auth.strategy('jwt', 'jwt', {
    key: process.env.JWT_SECRET,
    validate: authValidation,
    verifyOptions: {
      algorithms: ['HS256'],
    }
  });

  server.auth.default("jwt");
  server.route(authRoutes as ServerRoute[]);
};

export default {
  register,
  name: "Authentication",
  version: "1.0.0",
  once: true,
};
