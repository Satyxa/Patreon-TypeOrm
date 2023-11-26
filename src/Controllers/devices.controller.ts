import {Controller, Delete, Get, Param, Req, UseGuards} from "@nestjs/common";
import {DevicesService} from "../Services/devices.service";
import {AuthGuard} from "../Middleware/AuthGuard";

console.log(5555555555555)
@Controller('security/devices')
export class DevicesController {
    constructor(private readonly DevicesService: DevicesService) {}
    @UseGuards(AuthGuard)
    @Get()
    async getDevices(@Req() req: any){
        console.log(11111111111111)
        return this.DevicesService.getDevices(req.userId)
    }
    @UseGuards(AuthGuard)
    @Delete()
    async deleteDevices(@Req() req: any){
        return this.DevicesService.deleteDevices(req.cookies.refreshToken, req.userId)
    }
    @UseGuards(AuthGuard)
    @Delete(':deviceId')
    async deleteDevice(@Param('deviceId') deviceId: string,
                       @Req() req: any){
        return this.DevicesService.deleteDevice(deviceId, req.userId)
    }
}