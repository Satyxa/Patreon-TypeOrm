import {Body, Controller, Get, Headers, HttpCode, Ip, Post, Req, Res} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "../Mongoose/UserSchema";
import {Model} from "mongoose";
import {createUserPayloadClass} from "../Types/classesTypes";
import {LoginService} from "../Services/login.service";
import Cookies from "nodemailer/lib/fetch/cookies";

@Controller('auth/login')
export class LoginController {
    constructor(private readonly LoginService: LoginService) {}

    @Get()
    async getMe(@Headers() headers){
        return this.LoginService.getMe(headers.authorization)
    }


    @Post()
    @HttpCode(200)
    async login(@Body() signInPayload,
                @Ip() ip, @Headers() headers,
                @Res({ passthrough: true }) res: any) {
        const {accessToken, RefreshToken} = await this.LoginService.login(signInPayload, ip, headers)
        res.cookie('refreshToken', RefreshToken, { httpOnly: true, secure: true });
        return {accessToken}
    }

    @Post()
    @HttpCode(204)
    async logout(@Req() req: any){
        return this.LoginService.logout(req.cookies.refreshToken)
    }

    @Post()
    @HttpCode(200)
    async getRefreshToken(@Req() req: any,
                          @Res({ passthrough: true }) res: any){
        const {accessToken, RefreshToken} = await this.LoginService.getRefreshToken(req.cookies.refreshToken)
        res.cookie('refreshToken', RefreshToken, { httpOnly: true, secure: true });
        return {accessToken}
    }
}