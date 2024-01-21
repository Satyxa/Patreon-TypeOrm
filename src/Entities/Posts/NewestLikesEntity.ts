import {Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {ExtendedLikesInfo} from "./ExtendedLikesInfoEntity";

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
    @ManyToOne(() => ExtendedLikesInfo, ex => ex.postId)
    postId: string
}

export class createNL {
    constructor(public newestLikeId: string,
                public addedAt: string,
                public userId: string,
                public login: string,
                public postId: string) {}
}