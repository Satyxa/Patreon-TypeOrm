import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Blog} from "./BlogEntity";

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
    @ManyToOne(() => Blog, b => b.id)
    blogId: string
    @Column({type: 'boolean', default: false})
    deletedStatus: boolean
}


// title*	[...]
// shortDescription*	[...]
// content*	[...]
// blogId*	[...]
// blogName*	[...]
// createdAt	[...]
// extendedLikesInfo