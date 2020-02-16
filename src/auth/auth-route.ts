import * as Hapi from '@hapi/hapi';
import * as Boom from '@hapi/boom';
import JWT from 'jsonwebtoken';

const authRoute: Hapi.ServerRoute = {
    method: ['GET', 'POST'],
    path: '/auth/google',
    handler(request, h) {
        if (!request.auth.isAuthenticated) {
            return Boom.unauthorized(`Authentication failed due to: ${request.auth.error.message}`);
        }

        const jwtToken = JWT.sign({
            sid: 0, //TODO
            exp: Math.floor(new Date().getTime() / 1000) + process.env.JWT_EXPIRATION_TIME,
        }, process.env.JWT_SECRET);

        return h.redirect(request.auth.credentials['query'] + '?access_token=' + jwtToken);
    },
    options: {
        auth: {
            strategy: 'google',
            mode: 'try'
        },
    },
};

export default authRoute;