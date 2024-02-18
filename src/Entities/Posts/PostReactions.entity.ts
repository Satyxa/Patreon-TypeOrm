import {Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {Post} from "./Post.entity";

@Entity()
export class PostReactions {
    @PrimaryGeneratedColumn("uuid")
    reactionId: string
    @Column({type: 'varchar'})
    userId: string
    @Column("uuid")
    entityId: string
    @Column({type: 'varchar'})
    status: 'Like' | 'Dislike'
    @Column({type: "varchar"})
    createdAt: string
    @Column({type: 'boolean', default: false})
    banned: boolean
}

export class createPR {
    constructor(public reactionId: string,
                public userId: string,
                public entityId: string,
                public status: string,
                public createdAt: string) {}
}