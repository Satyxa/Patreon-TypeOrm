// import {Column, Entity, ManyToOne, OneToOne, PrimaryColumn} from "typeorm";
// import {PairGame} from "./PairGame";
//
// @Entity()
// export class Player {
//     @PrimaryColumn("uuid")
//     id: string
//     @Column({type: "varchar"})
//     login: string
//     @Column()
//     activeGameId: string | null
//     @OneToOne(() => PairGame)
//     PairGame: PairGame
// }
//
export class createPlayer {
    public score = 0
    constructor(public id: string,
                public login: string) {}
}