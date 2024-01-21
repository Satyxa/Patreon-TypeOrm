import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Question} from "./QuestionEntity";
import {User} from "../User/UserEntity";

@Entity()
export class PairGame {
    @PrimaryGeneratedColumn("uuid")
    id: string
    @Column({type: 'varchar'})
    pairCreatedDate: string
    @Column({type: 'varchar'})
    startGameDate: string | null
    @Column({type: "varchar"})
    finishGameDate: string | null
    @Column({type: "varchar"})
    status: 'PendingSecondPlayer' | 'Active' | 'Finished'
    @Column({type: "int", default: 0})
    firstPlayerScore: number
    @Column({type: "int", default: 0})
    secondPlayerScore: number
    @Column()
    questions: Question[]
    @OneToOne(() => User)
    @JoinColumn()
    firstPlayerProgress: User
    @OneToOne(() => User)
    @JoinColumn()
    secondPlayerProgress: User | null
}

export class createPairGame {
    constructor(public id: string,
                public pairCreatedDate: string,
                public startGameDate: string| null,
                public finishGameDate: string | null,
                public status: 'PendingSecondPlayer' | 'Active' | 'Finished',
                public questions: Question[],
                public firstPlayerProgress: User,
                public secondPlayerProgress: User | null) {}
}