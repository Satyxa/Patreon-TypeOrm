import {Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {Comment} from "./CommentEntity";

@Entity()
export class LikesInfo {
    @Column({type: "int", default: 0})
    likesCount: number
    @Column({type: "int", default: 0})
    dislikesCount: number
    @Column({type: "varchar", default: 'None'})
    myStatus: string
    @OneToOne(() => Comment)
    comment: Comment
    @PrimaryGeneratedColumn("uuid")
    commentId: string
}

export class createLI {
    public likesCount = 0
    public dislikesCount = 0
    public myStatus = 'None'
    constructor(public commentId: string) {}
}