import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Post} from "./Posts/PostEntity";


@Entity()

export class Blog {
    @PrimaryGeneratedColumn("uuid")
    id: string
    @Column({type: "varchar"})
    name: string
    @Column({type: "varchar"})
    description: string
    @Column({type: "varchar"})
    websiteUrl: string
    @Column({type: "boolean"})
    isMembership: boolean
    @Column({type: "varchar"})
    createdAt: string
    @OneToMany(() => Post, p => p.blog)
    post: Post
    @Column({type: 'boolean', default: false})
    deleted: boolean
}

export class createBlog {
    public isMembership = false
    public deleted = false
    constructor(public id: string,
                public name: string,
                public description: string,
                public websiteUrl: string,
                public createdAt: string) {}
}