import UserService from '../service/user-service';
import UserValidator from './validator/user-validator';

const userRoutes = [
  {
    method: 'POST',
    path: '/signup',
    async handler(request, h) {
      await UserService.addUser(request, request.payload);
      return h.response();
    },
    options: {
      auth: false,
      validate: {
        payload: UserValidator.addUser,
      },
    },
  },
  {
    method: 'POST',
    path: '/signin',
    async handler(request, h) {
      return await UserService.loginUser(request.payload);
    },
    options: {
      auth: false,
      validate: {
        payload: UserValidator.loginUser,
      },
    },
  },
  {
    method: 'GET',
    path: '/profile',
    handler(request) {
      return UserService.getCurrentUser(request.auth.credentials.user);
    }
  }
];

export default userRoutes;
