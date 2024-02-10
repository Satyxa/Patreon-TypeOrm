import { Column, Entity, Generated, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Question } from './QuestionEntity';
import { PlayerProgress } from './PlayerProgressEntity';

@Entity()
export class UserAnswers {
  @ManyToOne(() => PlayerProgress, { onDelete: 'CASCADE' })
  @JoinColumn()
  ppId: string
  @Column('uuid')
  questionId: string
  @Column({type: 'varchar'})
  answerStatus: 'Correct' | 'Incorrect'
  @Column({ type: 'varchar'})
  addedAt: string
  @PrimaryGeneratedColumn('uuid')
  @Generated('uuid')
  userAnswerId: string
}

export class createUserAnswer {
  constructor(public questionId: string,
              public answerStatus: 'Correct' | 'Incorrect',
              public addedAt: string,
              public ppId: string) {}
}

export class createViewUserAnswer {
  constructor(public questionId: string,
              public answerStatus: 'Correct' | 'Incorrect',
              public addedAt: string) {}
}
