import * as Hapi from '@hapi/hapi';
import { ServerRoute } from '@hapi/hapi';

import UserRoutes from './user-routes';
import GameRoutes from './game-routes';

export default {
  name: 'api',
  version: '1.0.0',
  register(server: Hapi.Server) {
    server.route([
      ...(UserRoutes as ServerRoute[]),
      ...(GameRoutes as ServerRoute[]),
    ]);
  },
};
