import {Body, Controller, Headers, HttpCode, Ip, Post} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "../Mongoose/UserSchema";
import {Model} from "mongoose";
import {createUserPayloadClass} from "../Types/classesTypes";
import {LoginService} from "../Services/login.service";
import Cookies from "nodemailer/lib/fetch/cookies";

@Controller('auth/login')
export class LoginController {
    constructor(private readonly LoginService: LoginService) {}
    @Post()
    @HttpCode(200)
    async login(@Body() signInPayload, @Ip() ip, @Headers() headers) {
        console.log(headers)
        return await this.LoginService.login(signInPayload, ip, headers)
    }
}