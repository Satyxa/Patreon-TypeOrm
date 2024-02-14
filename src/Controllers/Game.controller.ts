import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import {GameService} from "../Services/Game.service";
import {AuthGuard} from "../Middleware/AuthGuard";
import { sendAnswerPayload, validId } from '../Types/classesTypes';



type queryPayload = {
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string
}

export type TOPQueryPayload = {
    pageNumber: number,
    pageSize: number,
    sort: string
}

@Controller('pair-game-quiz')
export class GameController {
    constructor(private readonly GameService: GameService) {}

    @UseGuards(AuthGuard)
    @Get('pairs/my-current')
    async getActiveGame(@Req() req: any) {
        return this.GameService.getActiveGame(req.userId)
    }

    @UseGuards(AuthGuard)
    @Get('pairs/my')
    @HttpCode(200)
    async getCurrentUserPairs(@Req() req: any,
                              @Query() payload: queryPayload) {
        return this.GameService.getMe(payload, req.userId)
    }

    @UseGuards(AuthGuard)
    @Get('pairs/:id')
    async getGameById(@Param() payload: validId,
                      @Req() req: any) {
        return this.GameService.getGameById(payload.id, req.userId)
    }

    @UseGuards(AuthGuard)
    @Post('pairs/connection')
    @HttpCode(200)
    async setConnectToGame(@Req() req: any) {
        return this.GameService.setConnectToGame(req.userId)
    }

    @UseGuards(AuthGuard)
    @Post('pairs/my-current/answers')
    @HttpCode(200)
    async sendAnswer(@Body() payload: sendAnswerPayload,
                     @Req() req: any){
        return this.GameService.sendAnswer(payload.answer, req.userId)
    }

    @UseGuards(AuthGuard)
    @Get('users/my-statistic')
    async getCurrentUserStatistic(@Req() req: any){
        return await this.GameService.getStatistic(req.userId)
    }

    @Get('users/top')
    async getUsersTop(@Query() payload: TOPQueryPayload){
        return await this.GameService.getUsersTop(payload)
    }
}