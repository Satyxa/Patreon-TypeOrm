import { Column, Entity, Generated, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Blog } from './Blog.entity';

@Entity()
export class BlogBanInfo {
  @Column({type: 'boolean', default: false})
  isBanned: boolean
  @Column({type: 'varchar', default: null, nullable: true})
  banDate: string | null
  @OneToOne(() => Blog, b => b.id, { onDelete: 'CASCADE' })
  blog: Blog
  @Column()
  blogId: string
  @PrimaryGeneratedColumn('uuid')
  @Generated('uuid')
  bbiId: string
}

export class createBlogBanInfo {
  constructor(public isBanned: boolean,
              public banDate: string | null,
              public blogId: string) {
  }
}