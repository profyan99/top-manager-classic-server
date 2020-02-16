import * as Boom from '@hapi/boom';
import * as Iron from '@hapi/iron';

import {User} from "../entity/user/User";
import {UserRole} from "../entity/user/UserRole";
import {getCustomRepository} from "typeorm";
import {UserRepository} from "../repository/user-repository";
import {UserGameStats} from "../entity/user/UserGameStats";
import {ResponseToolkit} from "@hapi/hapi";

const addUser = async ({userName, email, password, avatar}, h: ResponseToolkit) => {
    const userRepository: UserRepository = getCustomRepository(UserRepository);

    if (await userRepository.find({where: {userName}})) {
        throw Boom.badRequest('Пользователь с таким никнеймом уже существует.');
    }

    if (await userRepository.find({where: {email}})) {
        throw Boom.badRequest('Пользователь с таким email адресом уже существует.');
    }
    //TODO retrieve IP address
    const encryptedPassword = password ? await Iron.seal(password, process.env.PASSWORD_SALT, Iron.defaults) : password;
    const user: User = new User({
        email,
        userName,
        avatar,
        password: encryptedPassword,
        ip: '',
        lastLogIn: new Date(),
        roles: [UserRole.PLAYER, UserRole.UNVERIFIED],
        gameStats: new UserGameStats()
    });
    await userRepository.save(user);
    return h.response();
};

const getCurrentUser = (user: User) => {
    return {
        id: user.id,
        userName: user.userName,
        avatar: user.avatar,
        roles: user.roles,
        gameStats: user.gameStats,
    };
};

export default {
    addUser,
    getCurrentUser,
}