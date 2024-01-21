import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {ExtendedLikesInfo} from "../Posts/ExtendedLikesInfoEntity";
import {createLI, LikesInfo} from "./LikesInfoEntity";
import {CommentatorInfo, createCI} from "./CommentatorInfoEntity";
import {CommentReactions} from "./CommentReactionsEntity";
import {Post} from "../Posts/PostEntity";

@Entity()
export class Comment {
    @PrimaryGeneratedColumn("uuid")
    id: string
    @Column({type: 'varchar'})
    content: string
    @OneToOne(() => CommentatorInfo)
    @JoinColumn()
    CommentatorInfo: CommentatorInfo
    @Column({type: "varchar"})
    createdAt: string
    @OneToOne(() => LikesInfo)
    @JoinColumn()
    LikesInfo: LikesInfo
    @Column({type: 'boolean', default: false})
    deleted: boolean
    @ManyToOne(() => Post)
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