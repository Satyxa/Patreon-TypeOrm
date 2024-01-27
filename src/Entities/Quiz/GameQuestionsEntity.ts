import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class GameQuestions {
    @PrimaryGeneratedColumn("uuid")
    gameQuestionId: string
    @Column()
    questionId: string
    @Column()
    gameId: string
    @Column()
    body: string
    @Column()
    answers: string
}

export class ViewGameQuestions {
    constructor(public body: string,
                public id: string) {}
}

export class createGameQuestion {
    constructor(public gameQuestionId: string,
                public questionId: string,
                public gameId: string,
                public body: string,
                public answers: string,) {}
}