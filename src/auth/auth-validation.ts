import UserService from '../service/user-service';
import {User} from "../entity/user/User";

interface ValidationPayload {
  isValid: boolean;
  credentials?: { user: User };
}

export default async (decoded, request, h): Promise<ValidationPayload> => {
  const user = await UserService.getUserById(decoded['id']);
  if (!user) {
    return {
      isValid: false,
    };
  }
  return {
    isValid: true,
    credentials: {
      user,
    },
  }
};
