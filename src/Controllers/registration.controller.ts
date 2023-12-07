import {BadRequestException, Body, Controller, HttpCode, Post} from "@nestjs/common";
import {createUserPayloadClass} from "../Types/classesTypes";
import {Throttle} from "@nestjs/throttler";
import { UserService } from '../Services/user.service';
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";

@Controller('auth/registration')
export class RegistrationController {
    constructor(private readonly UserService: UserService,
                @InjectDataSource protected dataSource: DataSource) {
    }

    @Throttle({default: {limit: 5, ttl: 10000,}})
    @Post()
    @HttpCode(204)
    async registration(@Body() createUserPayload: createUserPayloadClass) {
        const userByLogin = await this.dataSource.query(`
        SELECT * FROM "Users" where login = $1
        `, [createUserPayload.login])
        const userByEmail = await this.dataSource.query(`
        SELECT * FROM "Users" where email = $1
        `, [createUserPayload.email])
        if (userByEmail || userByLogin) throw new BadRequestException([{
            message: 'email or login already exist',
            field: userByLogin ? 'login' : 'email'
        }])
        await this.UserService.createUser(createUserPayload)
        return
    }
}