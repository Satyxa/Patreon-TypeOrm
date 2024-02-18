import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import {
  createDBPlayerProgress,
  createViewPlayerProgress,
  PlayerProgress,
} from './PlayerProgress.entity';
import { createDBGameQuestion, createViewGameQuestion, GameQuestions } from './GameQuestions.entity';

@Entity()
export class PairGame {
  @PrimaryGeneratedColumn("uuid")
  id: string
  @Column({type: "varchar"})
  status: "PendingSecondPlayer" | 'Active' | 'Finished'
  @Column({type: "varchar"})
  pairCreatedDate: string
  @Column({type: "varchar", nullable: true, default: null})
  startGameDate: string | null
  @Column({type: "varchar", nullable: true, default: null})
  finishGameDate: string | null
  @OneToOne(() => PlayerProgress, { onDelete: 'CASCADE' })
  @JoinColumn()
  firstPlayerProgress: PlayerProgress | createDBPlayerProgress
  @OneToOne(() => PlayerProgress, { onDelete: 'CASCADE' })
  @JoinColumn()
  secondPlayerProgress: PlayerProgress | createDBPlayerProgress | null
}

export class createViewPairGame {
  constructor(public id: string,
              public status: 'PendingSecondPlayer' | 'Active' | 'Finished',
              public pairCreatedDate: string,
              public startGameDate: string | null,
              public finishGameDate: string | null,
              public firstPlayerProgress: createViewPlayerProgress,
              public secondPlayerProgress: createViewPlayerProgress | null,
              public questions: createViewGameQuestion[] | null) {}
}

export class createNewPairGame {
  public questions =  null
  public secondPlayerProgress = null
  public startGameDate = null
  public finishGameDate = null
  public status = 'PendingSecondPlayer'

  constructor(public id: string,
              public pairCreatedDate: string,
              public firstPlayerProgress: createDBPlayerProgress,) {}
}