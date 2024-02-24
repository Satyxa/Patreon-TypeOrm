import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Blog, createBlog} from "../Blog/Blog.entity";
import {createELI, ExtendedLikesInfo} from "./ExtendedLikesInfo.entity";
import {Comment, createComment} from "../Comment/Comment.entity";

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
    @ManyToOne(() => Blog,
        b => b.id, { onDelete: 'CASCADE' })
    @JoinColumn()
    blog: string
    @OneToOne(() => ExtendedLikesInfo,
      { onDelete: 'CASCADE' })
    @JoinColumn()
    ExtendedLikesInfo: ExtendedLikesInfo
    @OneToMany(() => Comment,
        c => c.post, { onDelete: 'CASCADE' })
    comment: Comment
    @Column({type: 'boolean', default: false})
    isBanned: boolean
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