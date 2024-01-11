import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";


@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string
    @Column()
    login: string
    @Column()
    email: string
    @Column()
    createdAt: string
    @Column()
    expirationDate: string
    @Column()
    isConfirmed: boolean
    @Column()
    passwordHash: string
    @Column()
    createdAt: Date
}