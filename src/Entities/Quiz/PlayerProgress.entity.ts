import { Column, Entity, Generated, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { createViewUserAnswer, UserAnswers } from './UserAnswers.entity';
import { Player } from './Player.entity';

@Entity()
export class PlayerProgress {
  @PrimaryGeneratedColumn('uuid')
  @Generated("uuid")
  ppId: string
  @Column({type: 'int', default: 0})
  score: number
  @OneToMany(() => UserAnswers, ua => ua.userAnswerId, { onDelete: 'CASCADE' })
  @JoinColumn()
  answers: UserAnswers[]
  @ManyToOne(() => Player, { onDelete: 'CASCADE' })
  @JoinColumn()
  player: Player
}

export class createViewPlayerProgress {
  constructor(public score: number,
              public answers: createViewUserAnswer[],
              public player: Player) {}
}

export class createDBPlayerProgress {
  constructor(public score: number,
              public player: Player) {}
}

