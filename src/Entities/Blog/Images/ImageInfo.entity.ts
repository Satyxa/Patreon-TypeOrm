import { Column, Entity, Generated, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Blog } from '../Blog.entity';

@Entity()
export class ImageInfo {
  @ManyToOne(() => Blog, b => b.id, {onDelete: 'CASCADE'})
  @JoinColumn()
  blogId: string
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
}


export class createImageInfo {
  constructor(public blogId: string,
              public url: string,
              public height: number,
              public width: number,
              public fileSize: number,
              public type: string) {
  }
}


export class createViewImageInfo {
  constructor(public url: string,
              public height: number,
              public width: number,
              public fileSize: number) {
  }
}