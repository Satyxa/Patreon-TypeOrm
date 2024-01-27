import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {Answers, viewAnswer} from "./AnswersEntity";

@Entity()
export class Player {
    @PrimaryGeneratedColumn("uuid")
    playerId: string
    @Column("uuid")
    userId: string
    @Column("uuid")
    gameId: string
    @Column({type: "varchar"})
    login: string
    @Column({type: "int", default: 0})
    score: number
}

export class viewPlayer {
    constructor(public id: string,
                public login: string) {}
}


export class PlayerProgress {
    public answers: viewAnswer[]
    public score = 0
    public player: viewPlayer | null
    constructor(public answersArr: Answers[],
                public playerDB: Player | null) {
        this.answers = answersArr.map(a => {
            return {
                questionId: a.questionId,
                answerStatus: a.answerStatus,
                addedAt: a.addedAt
            }
        })
        this.score = playerDB ? playerDB.score : 0
        this.player = playerDB ? new viewPlayer(playerDB.userId, playerDB.login) : null
    }
}

export const createPlayerProgress = (player, answers) => {
    return player ? {
        score: player.score,
        answers,
        player: {
            id: player.id,
            login: player.login
        }
    } : null
}