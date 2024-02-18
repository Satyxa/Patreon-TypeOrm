import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User.entity';

@Entity()
export class BanInfo {
  @OneToOne(() => User)
  user: User
  @PrimaryGeneratedColumn('uuid')
  banInfoId: string
  @Column({type: 'boolean'})
  isBanned: boolean
  @Column({type: 'varchar', nullable: true})
  banDate: string | null
  @Column({type: 'varchar', nullable: true})
  banReason: string | null
  @Column()
  userId: string
}


export class createBanInfo {
  public banDate: string | null = null
  public isBanned = false
  constructor(public banReason: string | null,
              public userId: string) {}
}