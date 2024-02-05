import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './UserEntity';

@Entity()
export class Statistic {
  @OneToOne(() => User)
  @JoinColumn()
  userId: string
  @Column({type: 'int', default: 0})
  sumScore: number
  @Column({type: 'varchar', default: '0'})
  avgScores: string
  @Column({type: 'int', default: 0})
  gamesCount: number
  @Column({type: 'int', default: 0})
  winsCount: number
  @Column({type: 'int', default: 0})
  lossesCount: number
  @Column({type: 'int', default: 0})
  drawsCount: number
}

// statistic must be created together with user and player