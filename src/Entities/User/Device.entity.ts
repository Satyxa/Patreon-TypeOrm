import {Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User.entity";

@Entity()
export class Device {
    @PrimaryGeneratedColumn("uuid")
    deviceId: string
    @Column({type: 'varchar'})
    ip: string
    @Column({type: 'varchar'})
    title: string
    @Column({type: 'varchar'})
    lastActiveDate: string
    @ManyToOne(() => User,
      { onDelete: 'CASCADE' })
    user: User
    @Column({type: 'uuid'})
    userId: string
    @Column({default: false, type: 'boolean'})
    deleted: boolean
}

export class createDevice {
    public deleted: false
    constructor(public deviceId: string,
                public ip: string,
                public title: string,
                public lastActiveDate: string,
                public userId: string) {}
}