import * as Nes from '@hapi/nes';
import * as Hapi from '@hapi/hapi';
import {Socket} from "@hapi/nes";

import GameService from './game-service';

let socket: Hapi.Server = null;

export async function registerWebsocketServer(server: Hapi.Server) {
  socket = server;
  await server.register({
    plugin: Nes,
    options: {
      auth: {
        type: 'cookie',
        cookie: 'nes-auth',
        password: process.env.AUTH_COOKIE_PASSWORD,
        isSecure: process.env.NODE_ENV === 'production',
        index: true,
        isHttpOnly: false,
        endpoint: '/api/nes/auth',
      },
    }
  });
  socket.subscription('/games', {
    auth: {
      mode: 'required',
      entity: 'user',
      index: true,
    },
  });

  socket.subscription('/games/{gameId}', {
    auth: {
      mode: 'required',
      entity: 'user',
      index: true,
    },
    async onSubscribe(socket: Socket, path, params): Promise<any> {
      const result = await GameService.checkUserInGame({
        ...params,
        userName: socket.auth.credentials.user,
      });
      if (result) {
        return Promise.resolve();
      }
      return Promise.reject();
    },
  });
}

export const publish = (path, message, options = {}): void => {
  if (!socket) {
    return;
  }
  socket.publish(path, message, options);
};

export default {
  publish,
};
