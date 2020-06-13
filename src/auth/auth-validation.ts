import UserService from '../service/user-service';
import { User } from '../entity/user/User';

interface ValidationPayload {
  isValid: boolean;
  credentials?: { profile: User; user: string };
}

export default async (decoded): Promise<ValidationPayload> => {
  const user = await UserService.getUserById(decoded['id']);
  if (!user) {
    return {
      isValid: false,
    };
  }
  return {
    isValid: true,
    credentials: {
      profile: user,
      user: user.userName,
    },
  };
};
