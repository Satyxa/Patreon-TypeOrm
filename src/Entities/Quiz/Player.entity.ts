import { Column, Entity, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { PlayerProgress } from './PlayerProgress.entity';

@Entity()
export class Player {
  @PrimaryColumn('uuid')
  id: string
  @Column({ type: 'varchar' })
  login: string
  @OneToMany(() => PlayerProgress, p => p.player,
    { onDelete: 'CASCADE' })
  PlayerProgress: PlayerProgress
}