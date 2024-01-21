import {Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {createNL, NewestLikes} from "./NewestLikesEntity";

@Entity()
export class ExtendedLikesInfo {
    @PrimaryGeneratedColumn("uuid")
    postId: string
    @Column({type: "int", default: 0})
    likesCount: number
    @Column({type: "int", default: 0})
    dislikesCount: number
    @Column({type: "varchar", default: 'None'})
    myStatus: 'None' | 'Like' | 'Dislike'
}

export class createELI {
    public likesCount = 0
    public dislikesCount = 0
    public myStatus = 'None'
    constructor(public postId?: string) {
    }
}