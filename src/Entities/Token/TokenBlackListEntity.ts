import {Column, Entity, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class TokenBlackList {
    @PrimaryColumn()
    token: string
}