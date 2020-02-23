import * as Hapi from '@hapi/hapi';
import "reflect-metadata";
import {createConnection} from "typeorm";
import {config} from 'dotenv';

import routes from './route';
import Authentication from './auth';

config();

const server = new Hapi.Server({
  debug: {request: ['error']},
  host: '127.0.0.1',
  port: process.env.PORT,
  routes: {
    "cors": true
  },
});

process.on("uncaughtException", (error: Error) => {
  console.error(`uncaughtException ${error.message}`);
});

process.on("unhandledRejection", (reason: any) => {
  console.error(`unhandledRejection ${reason}`);
});

Authentication.register(server)
  .then(() => server.register(routes, {routes: {prefix: '/api'}}))
  .then(() => server.start())
  .then(() => createConnection())
  .then(() => console.log('Started  at', process.env.PORT))
  .catch((err) => {
    console.error(err);
    process.exit(1)
  });
