import {Body, Controller, Get, Param, Post, Req, UseGuards} from "@nestjs/common";
import {GameService} from "../Services/Game.service";
import {AuthGuard} from "../Middleware/AuthGuard";
import {sendAnswerPayload} from "../Types/classesTypes";

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
    async getGameById(@Param('id') id: string,
                      @Req() req: any) {
        return this.GameService.getGameById(id, req.userId)
    }

    @UseGuards(AuthGuard)
    @Post('connection')
    async setConnectToGame(@Req() req: any) {
        return this.GameService.setConnectToGame(req.userId)
    }

    @UseGuards(AuthGuard)
    @Post('my-current/answers')
    async sendAnswer(@Body() payload: sendAnswerPayload,
                     @Req() req: any){
        return this.GameService.sendAnswer(payload.answer, req.userId)
    }
}