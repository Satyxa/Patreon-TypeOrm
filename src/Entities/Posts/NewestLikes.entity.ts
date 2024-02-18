import {Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {ExtendedLikesInfo} from "./ExtendedLikesInfo.entity";

@Entity()
export class NewestLikes {
    @PrimaryGeneratedColumn("uuid")
    newestLikeId: string
    @Column({type: 'varchar'})
    addedAt: string
    @Column("uuid")
    userId: string
    @Column({type: 'varchar'})
    login: string
    @ManyToOne(() => ExtendedLikesInfo,
        ex => ex.postId, { onDelete: 'CASCADE' })
    postId: string
    @Column({type: 'boolean', default: false})
    banned: boolean
}

export class createNL {
    constructor(public newestLikeId: string,
                public addedAt: string,
                public userId: string,
                public login: string,
                public postId: string) {}
}