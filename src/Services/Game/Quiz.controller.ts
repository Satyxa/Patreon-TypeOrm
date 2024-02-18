import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import {QuestionService} from "./Question.service";
import {BasicAuthGuard} from "../../Middleware/Guards";
import {createQuestionIM, updateQuestionPublishIM} from "../../Entities/Quiz/Question.entity";


type queryPayload = {
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    bodySearchTerm: string,
    publishedStatus: string,
    sortDirection: string
}

@Controller('sa/quiz/questions')
export class QuizController {
    constructor(private readonly QuizService: QuestionService) {}

    @UseGuards(BasicAuthGuard)
    @Get('')
    async getAllQuestions(@Query() payload: queryPayload) {
        return await this.QuizService.getAllQuestions(payload)
    }
    @UseGuards(BasicAuthGuard)
    @Post('')
    @HttpCode(201)
    async createQuestion(@Body() payload: createQuestionIM) {
        return await this.QuizService.createQuestion(payload)
    }
    @UseGuards(BasicAuthGuard)
    @Delete(':id')
    @HttpCode(204)
    async deleteQuestion(@Param("id") id: string){
        return this.QuizService.deleteQuestion(id)
    }
    @UseGuards(BasicAuthGuard)
    @Put(':id')
    @HttpCode(204)
    async updateQuestion(@Param('id') id: string,
                         @Body() payload: createQuestionIM) {
        return this.QuizService.updateQuestion(id, payload)
    }
    @UseGuards(BasicAuthGuard)
    @Put(':id/publish')
    @HttpCode(204)
    async updateQuestionPublished(@Param('id') id: string,
                                  @Body() payload: updateQuestionPublishIM){
        return this.QuizService.updateQuestionPublished(id, payload.published)
    }
}