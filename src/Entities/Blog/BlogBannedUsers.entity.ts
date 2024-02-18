import { Column, Entity, Generated, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Blog } from './Blog.entity';

@Entity()
export class BlogBannedUsers {
  @PrimaryGeneratedColumn('uuid')
  @Generated('uuid')
  BBUId: string
  @Column({type: 'varchar'})
  userId: string
  @Column({type: 'varchar'})
  blogId: string
  @Column({type: 'varchar'})
  banReason: string
  @Column({type: 'varchar'})
  login: string
  @Column({type: 'varchar'})
  banDate: string
}

export class createBlogBannedUser {
  constructor(public userId: string,
              public blogId: string,
              public banReason: string,
              public login: string,
              public banDate: string,
              public isBanned: boolean,) {
  }
}