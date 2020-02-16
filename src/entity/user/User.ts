import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from "typeorm";
import {UserRole} from "./UserRole";
import {UserGameStats} from "./UserGameStats";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column({unique: true})
    userName: string;

    @Column()
    ip: string;

    @CreateDateColumn({type: 'date'})
    registerDate: string;

    @Column()
    lastLogIn: Date;

    @Column()
    password: string;

    @Column()
    avatar: string;

    @Column({
        type: "enum",
        enum: UserRole,
        array: true,
    })
    roles: UserRole[];

    @Column(type => UserGameStats)
    gameStats: UserGameStats;


    constructor({
                    id, email, userName, ip, registerDate,
                    lastLogIn, password, avatar, roles, gameStats
                }:
                    {
                        id?: number, email: string, userName: string, ip: string, registerDate?: string, lastLogIn: Date,
                        password: string, avatar: string, roles: UserRole[], gameStats: UserGameStats
                    }) {
        this.id = id;
        this.email = email;
        this.userName = userName;
        this.ip = ip;
        this.registerDate = registerDate;
        this.lastLogIn = lastLogIn;
        this.password = password;
        this.avatar = avatar;
        this.roles = roles;
        this.gameStats = gameStats;
    }
}
