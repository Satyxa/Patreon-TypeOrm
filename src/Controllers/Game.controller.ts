import {Body, Controller, Get, Param, Post, Req, UseGuards} from "@nestjs/common";
import {GameService} from "../Services/Game.service";
import {AuthGuard} from "../Middleware/AuthGuard";

@Controller('pair-game-quiz/pairs')
export class GameController {
    constructor(private readonly GameService: GameService) {}

    @UseGuards(AuthGuard)
    @Get('my-current')
    async getActiveGame(@Req() req: any) {

    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async getGameById(@Param('id') id: string) {

    }

    @UseGuards(AuthGuard)
    @Post('connection')
    async setConnectToGame() {

    }

    @UseGuards(AuthGuard)
    @Post('my-current/answers')
    async sendAnswer(@Body() payload){

    }
}