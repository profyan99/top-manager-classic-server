import * as Nes from '@hapi/nes';
import * as Hapi from '@hapi/hapi';
import {Socket} from "@hapi/nes";

import GameService from './game-service';
import UserService from './user-service';

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
      async onConnection(socket: Socket) {
        await UserService.setUserOnline(await UserService.getUserByUserName(socket.auth.credentials.user), true);
        server.logger().info(`User ${socket.auth.credentials.user} connected via websocket`);
      },
      async onDisconnection(socket: Socket) {
        await UserService.setUserOnline(await UserService.getUserByUserName(socket.auth.credentials.user), false);
        server.logger().info(`User ${socket.auth.credentials.user} disconnected via websocket`);
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
      const result = await GameService.connectToGameViaWebsocket({
        ...params,
        userName: socket.auth.credentials.user,
      });
      if (result) {
        return Promise.resolve();
      }
      return Promise.reject();
    },
    async onUnsubscribe(socket: Socket, path) {
      server.logger().info(`User ${socket.auth.credentials.user} unsubscribed from [${path}] via websocket`);
      await GameService.disconnectFromGameViaWebsocket({
        userName: socket.auth.credentials.user,
      });
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
