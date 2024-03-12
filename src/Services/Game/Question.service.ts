import { HttpException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {createQuestion, createViewQuestion, Question} from "../../Entities/Quiz/Question.entity";
import * as uuid from 'uuid'
import { CorrectAnswers } from '../../Entities/Quiz/CorrectAnswers.entity';
import { EntityUtils } from '../../Utils/Entity.utils';
import { questionsPS } from '../../Utils/PaginationAndSort';
@Injectable()
export class QuestionService {
    constructor(@InjectRepository(Question)
                private readonly QuestionRepository: Repository<Question>,
                @InjectRepository(CorrectAnswers)
                private readonly CorrectAnswersRepository: Repository<CorrectAnswers>,
                @InjectDataSource() dataSource: DataSource){}

    async deleteAll(){await this.QuestionRepository.delete({})}

    async getAllQuestions(payload) {
        const {questions, pagesCount, pageNumber, pageSize, totalCount} =
          await questionsPS(this.QuestionRepository, payload)

        const correctAnswers =
          await this.CorrectAnswersRepository
          .createQueryBuilder("a")
          .getMany()

        const viewQuestions = questions.map(q => {
            let answers: string[] = []

            correctAnswers.map(a => {
                if (a.questionId === q.id) answers.push(a.answer);
            })

            return new createViewQuestion(
              q.id, q.body, q.createdAt, q.updatedAt,
              answers, q.published,
            );
        })

        return ({
            pagesCount, page: pageNumber, pageSize,
            totalCount, items: viewQuestions})
    }

    async createQuestion(payload) {
        const {body, correctAnswers} = payload
        const id = uuid.v4()
        const createdAt = new Date().toISOString()

        // INSERT ANSWERS FOR QUESTIONS INTO THE TABLE
        const newAnswers = EntityUtils.getAnswers(correctAnswers, id)
        await this.CorrectAnswersRepository.save(newAnswers)

        const question: createQuestion =
            new createQuestion(id, body, createdAt, correctAnswers.join(','))


        // SAVE QUESTION
        await this.QuestionRepository.save(question)

        return new createViewQuestion(id, body, createdAt, null, correctAnswers, false)
    }

    async deleteQuestion(id) {
        if(!await this.QuestionRepository.findOneBy({id}))
            throw new HttpException('Not Found', 404)
        await this.QuestionRepository.delete({id})
    }

    async updateQuestion(id, payload) {
        const {body, correctAnswers} = payload
        const updatedAt = new Date().toISOString()

        const question =
          await this.QuestionRepository
            .findOneBy({ id })

        if(!question) throw new HttpException('Not Found', 404)

        // DELETE PREVIOUS ANSWERS
        await this.CorrectAnswersRepository
          .delete({questionId: id})

        // INSERT NEW ANSWERS
        const newAnswers = EntityUtils.getAnswers(correctAnswers, id)
        await this.CorrectAnswersRepository.save(newAnswers)

        // UPDATE QUESTION
        await this.QuestionRepository.update({id},
            { updatedAt, body })
    }

    async updateQuestionPublished(id, published) {
        if(!await this.QuestionRepository.findOneBy({id}))
            throw new HttpException('Not Found', 404)
        const updatedAt = new Date().toISOString()
        await this.QuestionRepository.update({id},
          {published: published, updatedAt})
    }
}