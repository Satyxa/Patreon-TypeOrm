import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import {Post} from "../Posts/Post.entity";
import { AccountData } from '../User/AccountData.entity';
import { BlogBanInfo, createBlogBanInfo } from './BlogBanInfo.entity';
import { ImageInfo } from './Images/ImageInfo.entity';


@Entity()
export class Blog {
    @PrimaryGeneratedColumn("uuid")
    id: string
    @Column({type: "varchar"})
    name: string
    @Column({type: "varchar"})
    description: string
    @Column({type: "varchar"})
    websiteUrl: string
    @Column({type: "boolean"})
    isMembership: boolean
    @Column({type: "varchar"})
    createdAt: string
    @OneToMany(() => Post,
        p => p.blog, { onDelete: 'CASCADE' })
    post: Post
    @ManyToOne(() => AccountData,
      { onDelete: 'CASCADE', nullable: true })
    @JoinColumn()
    AccountData: AccountData
    @OneToOne(() => BlogBanInfo, { onDelete: 'CASCADE' })
    @JoinColumn()
    banInfo: BlogBanInfo
    @OneToMany(() => ImageInfo,
        ii => ii.blogId,
      {nullable: true, onDelete: 'CASCADE'})
    @JoinColumn()
    images: ImageInfo[]
}

export class createBlog {
    public isMembership = false
    constructor(public id: string,
                public name: string,
                public description: string,
                public websiteUrl: string,
                public createdAt: string,
                public AccountData: AccountData,
                public banInfo: createBlogBanInfo) {}
}