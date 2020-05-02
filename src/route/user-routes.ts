import UserService from '../service/user-service';
import UserValidator from './validator/user-validator';
import {extractUserFromRequest} from "./common";

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
    handler(request) {
      return UserService.loginUser(request.payload);
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
      return UserService.getCurrentUser(extractUserFromRequest(request));
    }
  }
];

export default userRoutes;
