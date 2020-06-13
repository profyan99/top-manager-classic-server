import * as Hapi from '@hapi/hapi';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { config } from 'dotenv';

import routes from './route';
import Authentication from './auth';
import { registerWebsocketServer } from './service/websocket-service';
import startGameScheduler from './service/game-scheduler';
import logger from './logging';
import { disconnectAllUsers } from './service/user-service';

config();

export const server = new Hapi.Server({
  debug: { request: ['error'] },
  host: '127.0.0.1',
  port: process.env.PORT,
  routes: {
    cors: {
      origin: ['*'],
      credentials: true,
    },
  },
});

server.ext('onPreResponse', (request, h) => {
  if (request.response['isBoom']) {
    logger.warn('Request error', {
      response: request.response,
    });
  }
  return h.continue;
});

server.events.on('log', (event, tags) => {
  if (tags.error) {
    logger.error('Server error', {
      error: event.error,
      data: event.data,
      request: event.request,
    });
  } else {
    logger.info(`Server log: ${event.data}`);
  }
});

process.on('SIGINT', async function() {
  logger.info('Stopping server...');

  await disconnectAllUsers();
  server.stop({ timeout: 10000 }).then(() => {
    logger.info('Server stopped');
    process.exit(0);
  });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('uncaughtException', {
    message: error.message,
    trace: error.stack,
  });
});

process.on('unhandledRejection', (reason: any) => {
  logger.error('unhandledRejection', {
    reason,
  });
});

Authentication.register(server)
  .then(() => server.register(routes, { routes: { prefix: '/api' } }))
  .then(() => registerWebsocketServer(server))
  .then(() => server.start())
  .then(() => createConnection())
  .then(() => startGameScheduler())
  .then(() => logger.info(`Started at ${process.env.PORT}`))
  .catch(err => {
    logger ? logger.error(err) : console.log(err);
    process.exit(1);
  });
