import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Post, Put,
    Query, UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {BasicAuthGuard} from "../../Middleware/Guards";
import { createUserPayloadClass, UserBannedStatusPayload } from '../../Types/classesTypes';

export type queryPayload = {
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    searchLoginTerm: string,
    searchEmailTerm: string,
    searchNameTerm: string,
    sortDirection: string
}

@Controller('sa/users')
export class UserController {
    constructor(private readonly UserService: UserService) {}

    @UseGuards(BasicAuthGuard)
    @Get()
    async getAllUsers(@Query() payload: queryPayload) {
        return this.UserService.getAllUsers(payload)
    }
    // @UseGuards(BasicAuthGuard)
    // @Get(':id')
    // async getOneUser(@Param('id') id: string){
    //     return await this.UserService.getOneUser(id)
    // }
    @UseGuards(BasicAuthGuard)
    @Post()
    async createUser(@Body() createUserPayload: createUserPayloadClass) {
        return await this.UserService.createUser(createUserPayload)
    }
    @UseGuards(BasicAuthGuard)
    @Delete(':id')
    @HttpCode(204)
    async deleteUser(@Param('id') id: string){
        return await this.UserService.deleteUser(id)
    }

    @UseGuards(BasicAuthGuard)
    @Put(':id/ban')
    @HttpCode(204)
    async banUser(@Param('id') id: string,
                  @Body() payload: UserBannedStatusPayload){
        return await this.UserService.banUser(id, payload.isBanned, payload.banReason)
    }
}