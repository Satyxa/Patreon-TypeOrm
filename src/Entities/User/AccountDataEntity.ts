import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./UserEntity";

@Entity()
export class AccountData {
    @Column({type: 'varchar'})
    passwordHash: string
    @Column({type: 'varchar'})
    login: string
    @Column({type: 'varchar'})
    email: string
    @Column({type: 'varchar'})
    createdAt: string
    @OneToOne(() => User)
    user: User
    @PrimaryGeneratedColumn("uuid")
    userId: string
}

export class createAC {
    constructor(public passwordHash: string,
                public login: string,
                public email: string,
                public createdAt: string,
                public userId: string,) {}
}