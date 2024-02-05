import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Question } from './QuestionEntity';

@Entity()
export class CorrectAnswers {
  @PrimaryGeneratedColumn('uuid')
  id: string
  @Column({type: 'varchar'})
  answer: string
  @Column('uuid')
  questionId: string
}