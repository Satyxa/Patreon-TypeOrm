import {
  Column,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from './Question.entity';
import { PairGame } from './PairGame.entity';

@Entity()
export class GameQuestions {
  @PrimaryGeneratedColumn('uuid')
  @Generated('uuid')
  gameQuestionId: string
  @Column('uuid')
  questionId: string
  @Column({type: 'varchar'})
  body: string
  @ManyToOne(() => PairGame, { onDelete: 'CASCADE' })
  @JoinColumn()
  game: PairGame
}

export class createViewGameQuestion {
  constructor(public body: string,
              public id: string) {
  }
}

export class createDBGameQuestion {
  constructor(public game: PairGame,
              public questionId: string,
              public body: string) {
  }
}