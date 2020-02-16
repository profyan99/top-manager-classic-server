import * as Hapi from '@hapi/hapi';

import authValidation from './auth-validation';
import authRoute from './auth-route';

const register = async (server: Hapi.Server) => {
    await server.register(require('@hapi/bell'));
    await server.register(require('hapi-auth-jwt2'));

    server.auth.strategy('google', 'bell', {
        provider: 'google',
        password: process.env.GOOGLE_COOKIE_PASSWORD,
        isSecure: process.env.NODE_ENV === 'production',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        location: process.env.GOOGLE_API_LOCATION,
        providerParams: {
            access_type: 'offline',
        },
    });

    server.auth.strategy('jwt', 'jwt', {
        key: process.env.JWT_SECRET,
        validateFunc: authValidation,
        verifyOptions: {
            algorithms: ['HS256'],
        }
    });

    server.auth.default("jwt");
    server.route(authRoute);
};

export default {
    register,
    name: "Authentication",
    version: "1.0.0",
    once: true,
};