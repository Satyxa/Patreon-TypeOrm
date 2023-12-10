import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({name: 'users'})
export class Users {
    @PrimaryGeneratedColumn()
    id: string

    @Column()
    username: string

    @Column()
    email: string

    @Column()
    passwordHash: string

    @Column()
    createdAt: string

    @Column()
    confirmationCode: string

    @Column()
    expirationDate: string

    @Column()
    isConfirmed: boolean

    @Column()
    recoveryCode: string
}