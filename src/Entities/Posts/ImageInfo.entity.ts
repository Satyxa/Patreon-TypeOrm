import { Column, Entity, Generated, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './Post.entity';

@Entity()
export class PostImageInfo {
  @ManyToOne(() => Post, b => b.id, {onDelete: 'CASCADE'})
  @JoinColumn()
  postId: string
  @PrimaryGeneratedColumn('uuid')
  @Generated('uuid')
  iiId: string
  @Column({type: 'varchar'})
  url: string
  @Column({type: 'int'})
  height: number
  @Column({type: 'int'})
  width: number
  @Column({type: 'int'})
  fileSize: number
  @Column({type: 'varchar'})
  type: string
  @ManyToOne(() => Post,
    p => p.id,
    {onDelete: 'CASCADE'})
  @JoinColumn()
  post: Post
}


export class createPostImageInfo {
  constructor(public postId: string,
              public url: string,
              public height: number,
              public width: number,
              public fileSize: number,
              public type: string) {
  }
}


export class createPostViewImageInfo {
  constructor(public url: string,
              public height: number,
              public width: number,
              public fileSize: number) {
  }
}