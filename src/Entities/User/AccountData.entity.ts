import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import {User} from "./User.entity";
import { Blog } from '../Blog/Blog.entity';

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
    @OneToOne(() => User, { onDelete: 'CASCADE' })
    user: User
    @PrimaryGeneratedColumn("uuid")
    userId: string
    @OneToMany(() => Blog,
      b => b.AccountData, { onDelete: 'CASCADE' })
    blog: Blog
}

export class createAC {
    constructor(public passwordHash: string,
                public login: string,
                public email: string,
                public createdAt: string,
                public userId: string,) {}
}