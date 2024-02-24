import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {ExtendedLikesInfo} from "../Posts/ExtendedLikesInfo.entity";
import {createLI, LikesInfo} from "./LikesInfo.entity";
import {CommentatorInfo, createCI} from "./CommentatorInfo.entity";
import {CommentReactions} from "./CommentReactions.entity";
import {Post} from "../Posts/Post.entity";

@Entity()
export class Comment {
    @PrimaryGeneratedColumn("uuid")
    id: string
    @Column({type: 'varchar'})
    content: string
    @OneToOne(() => CommentatorInfo, { onDelete: 'CASCADE' })
    @JoinColumn()
    CommentatorInfo: CommentatorInfo
    @Column({type: "varchar"})
    createdAt: string
    @OneToOne(() => LikesInfo, { onDelete: 'CASCADE' })
    @JoinColumn()
    LikesInfo: LikesInfo
    @ManyToOne(() => Post, { onDelete: 'CASCADE' })
    @JoinColumn()
    post: Post
    @Column({type: "uuid"})
    postId: string
}

export class createComment {
    public deleted: false
    constructor(public id: string,
                public content: string,
                public CommentatorInfo: createCI,
                public LikesInfo: createLI,
                public createdAt: string,
                public postId: string,) {}
}
// deleted status заменить на deleted