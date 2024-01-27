import {Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {AccountData, createAC} from "./AccountDataEntity";
import {createEC, EmailConfirmation} from "./EmailConfirmationEntity";
import {Device} from "../DeviceEntity";


@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string
    @Column({type: 'varchar'})
    recoveryCode: string
    @OneToOne(() => AccountData)
    @JoinColumn()
    AccountData: AccountData
    @OneToOne(() => EmailConfirmation)
    @JoinColumn()
    EmailConfirmation: EmailConfirmation
    @OneToMany(() => Device, d => d.user)
    @JoinColumn()
    Devices: Device[]
    @Column({default: false, type: 'boolean'})
    deleted: boolean
}

export class createUser {
    public recoveryCode = ''
    public deleted = false
    constructor(public id: string,
                public AccountData: createAC,
                public EmailConfirmation: createEC) {}
}