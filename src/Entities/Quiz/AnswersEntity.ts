import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";


@Entity()
export class Answers {
    @PrimaryGeneratedColumn("uuid")
    id: string
    @Column()
    userId: string
    @Column()
    gameId: string
    @Column()
    questionId: string
    @Column()
    answerStatus: 'Correct' | 'Incorrect'
    @Column()
    addedAt: string
}

export class viewAnswer {
    constructor(public addedAt: string,
                public questionId: string,
                public answerStatus: 'Correct' | 'Incorrect') {
    }
}

export class AnswerDB {
    constructor(public id: string,
                public userId: string,
                public gameId: string,
                public addedAt: string,
                public questionId: string,
                public answerStatus: 'Correct' | 'Incorrect',) {
    }
}