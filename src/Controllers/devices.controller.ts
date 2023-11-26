import {Body, Controller, Delete, Get, Headers, HttpCode, Ip, Param, Post, Req, Res} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "../Mongoose/UserSchema";
import {Model} from "mongoose";
import {createUserPayloadClass} from "../Types/classesTypes";
import {LoginService} from "../Services/login.service";
import Cookies from "nodemailer/lib/fetch/cookies";
import {DevicesService} from "../Services/devices.service";

@Controller('security/devices')
export class DevicesController {
    constructor(private readonly DevicesService: DevicesService) {}
    @Get()
    async getDevices(){
        return this.DevicesService.getDevices()
    }
    @Delete()
    async deleteDevices(@Req() req: any){
        return this.DevicesService.deleteDevices(req.cookies.refreshToken, req.userId)
    }
    @Delete(':deviceId')
    async deleteDevice(@Param('deviceId') deviceId: string,
                       @Req() req: any){
        return this.DevicesService.deleteDevice(deviceId, req.userId)
    }
}