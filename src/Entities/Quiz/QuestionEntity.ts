import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {ArrayMinSize, IsArray, IsBoolean, Length} from "class-validator";

@Entity()
export class Question {
    @PrimaryGeneratedColumn("uuid")
    id: string
    @Column({type: 'varchar'})
    body: string
    @Column()
    createdAt: string
    @Column()
    updatedAt: string
    @Column({type: 'boolean', default: false})
    published: boolean
    @Column({type: "varchar"})
    correctAnswers: string
}

export class createQuestion {
    public published = false
    constructor(public id: string,
                public body: string,
                public createdAt: string,
                public updatedAt: string,
                public correctAnswers: string){}
}

export class createViewQuestion {
    constructor(public id: string,
                public body: string,
                public createdAt: string,
                public updatedAt: string,
                public correctAnswers: string[],
                public published: boolean){}
}

export class createQuestionForPP {
    constructor(public id: string,
                public body: string){}
}



export class createQuestionIM {
    @Length(10, 500)
    body: string
    @IsArray()
    @ArrayMinSize(1)
    correctAnswers: string[]
}

export class updateQuestionPublishIM {
    @IsBoolean()
    published: boolean
}