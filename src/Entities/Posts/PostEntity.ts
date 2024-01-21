import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Blog, createBlog} from "../BlogEntity";
import {createELI, ExtendedLikesInfo} from "./ExtendedLikesInfoEntity";
import {Comment, createComment} from "../Comment/CommentEntity";

@Entity()
export class Post {
    @PrimaryGeneratedColumn("uuid")
    id: string
    @Column({type: "varchar"})
    title: string
    @Column({type: "varchar"})
    shortDescription: string
    @Column({type: "varchar"})
    content: string
    @Column({type: "varchar"})
    createdAt: string
    @Column({type: 'varchar'})
    blogName: string
    @ManyToOne(() => Blog, b => b.id)
    @JoinColumn()
    blog: string
    @Column({type: 'boolean', default: false})
    deleted: boolean
    @OneToOne(() => ExtendedLikesInfo)
    @JoinColumn()
    ExtendedLikesInfo: ExtendedLikesInfo
    @OneToMany(() => Comment, c => c.post)
    comment: Comment
}

// Join blog to post and add blog to post in creating

export class createPost {
    public deleted = false
    constructor(public id: string,
                public title: string,
                public shortDescription: string,
                public content: string,
                public createdAt: string,
                public blogName: string,
                public blog: createBlog,
                public ExtendedLikesInfo: createELI) {
    }
}