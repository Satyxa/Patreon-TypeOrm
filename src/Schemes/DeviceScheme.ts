import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({name: 'devices'})
export class Devices {
    @PrimaryGeneratedColumn()
    userId: string

    @Column()
    deviceId: string

    @Column()
    title: string

    @Column()
    ip: string

    @Column()
    lastActiveDate: string
}