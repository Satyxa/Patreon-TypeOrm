import { Controller, Delete, Get, Param, Req} from "@nestjs/common";
import {DevicesService} from "../Services/devices.service";

@Controller('security/devices')
export class DevicesController {
    constructor(private readonly DevicesService: DevicesService) {}
    @Get()
    async getDevices(@Req() req: any){
        return this.DevicesService.getDevices(req.userId)
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