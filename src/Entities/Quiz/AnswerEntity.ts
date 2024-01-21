import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Answer {
    @PrimaryGeneratedColumn('uuid')
    id: string
    @Column('uuid')
    questionId: string
    @Column({type: "varchar"})
    answerStatus: 'Correct' | 'Incorrect'
    @Column({type: "varchar"})
    addedAt: string
}

export class createAnswer {
    constructor(public id: string,
                public questionId: string,
                public answerStatus: 'Correct' | 'Incorrect',
                public addedAt: string) {}
}