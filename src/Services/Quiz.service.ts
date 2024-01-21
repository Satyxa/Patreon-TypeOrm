import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {createQuestion, createViewQuestion, Question} from "../Entities/Quiz/QuestionEntity";
import * as uuid from 'uuid'
@Injectable()
export class QuizService {
    constructor(@InjectRepository(Question)
                private readonly QuestionRepository: Repository<Question>) {}

    async deleteAll(){await this.QuestionRepository.delete({})}

    async getAllQuestions() {
        const questions = await this.QuestionRepository
            .createQueryBuilder("q")
            .getMany()

        return questions.map(q => new createViewQuestion(
            q.id, q.body, q.createdAt, q.updatedAt,
            q.correctAnswers.split(','), q.published
        ))
    }

    async createQuestion(payload) {
        const {body, correctAnswers} = payload
        const id = uuid.v4()
        const createdAt = new Date().toISOString()

        const question: createQuestion =
            new createQuestion(id, body, createdAt, createdAt, correctAnswers.join(','))

        await this.QuestionRepository.save(question)

        return new createViewQuestion(id, body, createdAt, createdAt, correctAnswers, false)
    }

    async deleteQuestion(id) {
        await this.QuestionRepository.delete({id})
    }

    async updateQuestion(id, payload) {
        const {body, correctAnswers} = payload
        const updatedAt = new Date().toISOString()

        await this.QuestionRepository.update({id},
            {correctAnswers: correctAnswers.join(','),
                        updatedAt, body})
    }

    async updateQuestionPublished(id, published) {
        await this.QuestionRepository.update({id}, {published: published})
    }
}