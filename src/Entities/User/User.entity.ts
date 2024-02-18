import {Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {AccountData, createAC} from "./AccountData.entity";
import {createEC, EmailConfirmation} from "./EmailConfirmation.entity";
import {Device} from "./Device.entity";
import { Statistic } from './Statistic.entity';
import { Blog } from '../Blog/Blog.entity';
import { BanInfo, createBanInfo } from './BanInfo.entity';


@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string
    @Column({type: 'varchar'})
    recoveryCode: string
    @OneToOne(() => AccountData, { onDelete: 'CASCADE' })
    @JoinColumn()
    AccountData: AccountData
    @OneToOne(() => EmailConfirmation, { onDelete: 'CASCADE' })
    @JoinColumn()
    EmailConfirmation: EmailConfirmation
    @OneToMany(() => Device,
        d => d.user, { onDelete: 'CASCADE' })
    @JoinColumn()
    Devices: Device[]
    @Column({default: false, type: 'boolean'})
    deleted: boolean
    @OneToOne(() => Statistic,
      { onDelete: 'CASCADE' })
    statistic: Statistic

    @OneToOne(() => BanInfo,
      { onDelete: 'CASCADE' })
    @JoinColumn()
    banInfo: BanInfo
}

export class createUser {
    public recoveryCode = ''
    public deleted = false
    constructor(public id: string,
                public AccountData: createAC,
                public EmailConfirmation: createEC,
                public banInfo: createBanInfo) {}
}