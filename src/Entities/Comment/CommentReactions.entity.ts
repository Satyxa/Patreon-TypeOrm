import {Column, Entity, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity()

export class CommentReactions {
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
}

export class createCR {
    constructor(public reactionId: string,
                public userId: string,
                public entityId: string,
                public status: string,
                public createdAt: string) {}
}