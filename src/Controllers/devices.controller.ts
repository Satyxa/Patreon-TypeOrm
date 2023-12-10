import {Controller, Delete, Get, HttpCode, Param, Req} from "@nestjs/common";
import {DevicesService} from "../Services/devices.service";

@Controller('security/devices')
export class DevicesController {
    constructor(private readonly DevicesService: DevicesService) {}

    @Delete('testing/all-data')
    async deleteAll(){
        return this.DevicesService.deleteAll()
    }

    @Get()
    async getDevices(@Req() req: any) {
        return await this.DevicesService.getDevices(req.cookies.refreshToken)
    }
    @Delete()
    @HttpCode(204)
    async deleteDevices(@Req() req: any){
        return await this.DevicesService.deleteDevices(req.cookies.refreshToken)
    }
    @Delete(':deviceId')
    @HttpCode(204)
    async deleteDevice(@Param('deviceId') deviceId: string,
                       @Req() req: any){
        return await this.DevicesService.deleteDevice(deviceId, req.cookies.refreshToken)
    }
}