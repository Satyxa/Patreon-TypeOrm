import {Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {Comment} from "./CommentEntity";

@Entity()
export class CommentatorInfo {
    @Column({type: "uuid"})
    userId: string
    @Column({type: "varchar"})
    userLogin: string
    @OneToOne(() => Comment)
    comment: Comment
    @PrimaryGeneratedColumn("uuid")
    commentId: string
}

export class createCI {
    constructor(public userId: string,
                public userLogin: string,
                public commentId: string) {}
}