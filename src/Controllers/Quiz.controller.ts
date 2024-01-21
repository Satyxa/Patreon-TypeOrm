import {Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseGuards} from "@nestjs/common";
import {createUserPayloadClass} from "../Types/classesTypes";
import {QuizService} from "../Services/Quiz.service";
import {BasicAuthGuard} from "../Middleware/AuthGuard";
import {createQuestionIM, updateQuestionPublishIM} from "../Entities/Quiz/QuestionEntity";

@Controller('sa/quiz/questions')
export class QuizController {
    constructor(private readonly QuizService: QuizService) {}

    @UseGuards(BasicAuthGuard)
    @Get('')
    async getAllQuestions() {
        return await this.QuizService.getAllQuestions()
    }
    @UseGuards(BasicAuthGuard)
    @Post('')
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