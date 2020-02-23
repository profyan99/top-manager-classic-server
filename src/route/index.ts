import UserRoutes from './user-routes';
import * as Hapi from "@hapi/hapi";
import {ServerRoute} from "@hapi/hapi";

export default {
  name: 'api',
  version: '1.0.0',
  register (server: Hapi.Server) {
    server.route([
      ...(UserRoutes as ServerRoute[]),
    ]);
  },
};
