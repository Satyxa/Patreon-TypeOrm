import {Body, Controller, Headers, Delete, Get, HttpCode, Param, Post, UseGuards, Ip, Res, Req} from "@nestjs/common";
import {BasicAuthGuard} from "../Middleware/AuthGuard";
import {LoginService} from "../Services/login.service";

@Controller('auth')
export class UserController {
    constructor(private readonly LoginService: LoginService) {}
    @UseGuards(BasicAuthGuard)
    @Get('me')
    async getMe(@Headers() headers) {
        return this.LoginService.getMe(headers.authorization)
    }
    @Post('login')
    async login(@Body() signInPayload,
                @Ip() ip,
                @Headers() headers,
                @Res({ passthrough: true }) res: any){
        const {accessToken, RefreshToken} = await this.LoginService.login(signInPayload, ip, headers)
        res.cookie('refreshToken', RefreshToken, { httpOnly: true, secure: true });
        return {accessToken}
    }
    @Post('logout')
    @HttpCode(204)
    async logout(@Req() req: any){
        return this.LoginService.logout(req.cookies.refreshToken)
    }
    @Post('refresh-token')
    @HttpCode(200)
    async getRefreshToken(@Req() req: any,
                          @Res({ passthrough: true }) res: any){
        const {accessToken, RefreshToken} = await this.LoginService.getRefreshToken(req.cookies.refreshToken)
        res.cookie('refreshToken', RefreshToken, { httpOnly: true, secure: true });
        return {accessToken}
    }
}