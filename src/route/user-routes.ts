import UserService from '../service/user-service';

export default [
    {
        method: 'GET',
        path: '/me',
        handler(request, h) {
            return UserService.getCurrentUser(request.auth.credentials.user);
        },
        options: {
            auth: 'false',
        }
    },
    {
        method: 'GET',
        path: '/me',
        handler(request, h) {
            return UserService.getCurrentUser(request.auth.credentials.user);
        }
    }
]