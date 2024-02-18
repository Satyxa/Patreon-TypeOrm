import {BadRequestException, Body, Controller, HttpCode, Post} from "@nestjs/common";
import {createUserPayloadClass} from "../../Types/classesTypes";
import {Throttle} from "@nestjs/throttler";
import { UserService } from './user.service';
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";

@Controller('auth')
export class RegistrationController {
    constructor(private readonly UserService: UserService) {
    }
    @Post('registration')
    @HttpCode(204)
    async registration(@Body() createUserPayload: createUserPayloadClass) {
        return await this.UserService.createUser(createUserPayload)
    }
}