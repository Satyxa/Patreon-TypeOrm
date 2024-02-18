import {Body, Controller, Headers, Delete, Get, HttpCode, Param, Post, UseGuards, Ip, Res, Req} from "@nestjs/common";
import {BasicAuthGuard} from "../../Middleware/Guards";
import {LoginService} from "./login.service";
import {Throttle} from "@nestjs/throttler";

@Controller('auth')
export class LoginController {
    constructor(private readonly LoginService: LoginService) {}
    @Get('me')
    async getMe(@Headers() headers) {
        return this.LoginService.getMe(headers.authorization)
    }

    @Post('login')
    @HttpCode(200)
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