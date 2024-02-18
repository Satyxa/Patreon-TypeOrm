import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User.entity";

@Entity()
export class EmailConfirmation {
    @Column({type: 'varchar'})
    expirationDate: string
    @Column({type: 'boolean'})
    isConfirmed: boolean
    @Column({type: 'varchar'})
    confirmationCode: string
    @OneToOne(() => User, { onDelete: 'CASCADE' })
    user: User
    @PrimaryGeneratedColumn("uuid")
    userId: string
}

export class createEC {
    public isConfirmed = false
    constructor(public expirationDate: string,
                public confirmationCode: string,
                public userId: string) {}
}