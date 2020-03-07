import * as Nes from '@hapi/nes';
import * as Hapi from '@hapi/hapi';
import {Socket} from "@hapi/nes";

let socket = null;

export async function registerWebsocketServer(server: Hapi.Server) {
  socket = server;
  await server.register({
    plugin: Nes,
    options: {
      auth: {
        type: 'cookie',
        cookie: 'ws-auth',
        password: process.env.AUTH_COOKIE_PASSWORD,
        isSecure: process.env.NODE_ENV === 'production',
        index: true,
        isHttpOnly: false,
        isSameSite: false,
        endpoint: '/api/nes/auth',
      },
    }
  });
  server.subscription('/roomList', {
    auth: {
      mode: 'required',
      entity: 'user',
      index: true,
    },
    onSubscribe(socket: Socket, path, params): Promise<any> {
      //TODO connected via websocket
      console.log('SUBSCRIBED: ', socket);
      return Promise.resolve();
    },
  });

  server.subscription('/room/{roomId}', {
    auth: {
      mode: 'required',
      entity: 'user',
      index: true,
    },
    onSubscribe(socket: Socket, path, params): Promise<any> {
      //TODO connected via websocket
      return Promise.resolve();
    },
  });
}
