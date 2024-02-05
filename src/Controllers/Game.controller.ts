import { BadRequestException, Body, Controller, Get, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import {GameService} from "../Services/Game.service";
import {AuthGuard} from "../Middleware/AuthGuard";
import { sendAnswerPayload, validId } from '../Types/classesTypes';

@Controller('pair-game-quiz/pairs')
export class GameController {
    constructor(private readonly GameService: GameService) {}

    @UseGuards(AuthGuard)
    @Get('my-current')
    async getActiveGame(@Req() req: any) {
        return this.GameService.getActiveGame(req.userId)
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async getGameById(@Param() payload: validId,
                      @Req() req: any) {
        return this.GameService.getGameById(payload.id, req.userId)
    }

    @UseGuards(AuthGuard)
    @Post('connection')
    @HttpCode(200)
    async setConnectToGame(@Req() req: any) {
        return this.GameService.setConnectToGame(req.userId)
    }

    @UseGuards(AuthGuard)
    @Post('my-current/answers')
    @HttpCode(200)
    async sendAnswer(@Body() payload: sendAnswerPayload,
                     @Req() req: any){
        return this.GameService.sendAnswer(payload.answer, req.userId)
    }
}