import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {PlayerProgress} from "./PlayerEntity";
import {GameQuestions, ViewGameQuestions} from "./GameQuestionsEntity";

@Entity()
export class PairGame {
    @PrimaryGeneratedColumn("uuid")
    id: string
    @Column({type: "varchar"})
    status: "PendingSecondPlayer" | 'Active' | 'Finished'
    @Column({type: "varchar"})
    pairCreatedDate: string
    @Column({type: "varchar", nullable: true})
    startGameDate: string | null
    @Column({type: "varchar", nullable: true})
    finishGameDate: string | null
    @Column({type: "varchar"})
    firstPlayerId: string
    @Column({type: "varchar", nullable: true})
    secondPlayerId: string | null
}

export class ViewPair {
    constructor(public id: string,
                public status: "PendingSecondPlayer" | 'Active' | 'Finished',
                public pairCreatedDate: string,
                public startGameDate: string | null,
                public finishGameDate: string | null,
                public firstPlayerProgress: PlayerProgress,
                public secondPlayerProgress: PlayerProgress | null,
                private questions: ViewGameQuestions[]) {}
}

export class createPairGame {
    constructor(public id: string,
                public status: "PendingSecondPlayer" | 'Active' | 'Finished',
                public pairCreatedDate: string,
                public startGameDate: string | null,
                public finishGameDate: string | null,
                public firstPlayerId: string,
                public secondPlayerId: string | null,){}
}