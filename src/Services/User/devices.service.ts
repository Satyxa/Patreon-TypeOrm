import {InjectDataSource, InjectRepository} from "@nestjs/typeorm";
import {DataSource, Repository} from "typeorm";
import {BadRequestException, HttpException, UnauthorizedException} from "@nestjs/common";
import {EmailConfirmationType, SessionsType} from "../../Types/types";
import {getResultByToken} from "../../Utils/authentication";
import {Device} from "../../Entities/User/Device.entity";
import {EntityUtils} from "../../Utils/Entity.utils";

export class DevicesService {
    constructor(@InjectRepository(Device)
                private readonly DeviceRepository: Repository<Device>,
                @InjectDataSource() private readonly dataSource: DataSource) {}

    async deleteAll(){
         await this.DeviceRepository.delete({})
        return
    }

    async getDevices(refreshToken){
        if(!getResultByToken(refreshToken)) throw new UnauthorizedException()
        const tokenPayload: any = getResultByToken(refreshToken)

        const sessions = await EntityUtils
            .getAllDevices(this.DeviceRepository, tokenPayload.userId)

        if(!sessions.length) throw new UnauthorizedException()
        return sessions
    }

    async deleteDevices(refreshToken) {
        if(!getResultByToken(refreshToken)) throw new UnauthorizedException()
        const tokenPayload: any = getResultByToken(refreshToken)

        const {deviceId} = tokenPayload

        const device = await this.DeviceRepository
            .createQueryBuilder("d")
            .where("d.deviceId = :deviceId", {deviceId})
            .getOne()

        if(!device) throw new HttpException('NOT FOUND', 404)

        await this.DeviceRepository
            .createQueryBuilder()
            .delete()
            .from("Device")
            .where("userId = :userId", {userId: tokenPayload.userId})
            .andWhere("deviceId != :deviceId", {deviceId})
            .execute()
    }

    async deleteDevice(deviceId, refreshToken){
        if (!getResultByToken(refreshToken)) throw new UnauthorizedException()
        const tokenPayload = getResultByToken(refreshToken)
        if (!tokenPayload) throw new UnauthorizedException()

        const device = await this.DeviceRepository
            .createQueryBuilder("d")
            .where("d.deviceId = :deviceId", {deviceId})
            .getOne()

        if(!device) throw new HttpException('NOT FOUND', 404)
        if(tokenPayload.userId !== device.userId) throw new HttpException('FORBIDDEN', 403)

        await this.DeviceRepository
            .delete({userId: tokenPayload.userId, deviceId})
    }
}