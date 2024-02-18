import {HttpException, UnauthorizedException} from "@nestjs/common";
import * as uuid from 'uuid'
import jwt from "jsonwebtoken";
import {createToken, getResultByToken} from "../../Utils/authentication";
import {FoundedUser, UserSQL, userT} from "../../Types/types";
import {InjectDataSource, InjectRepository} from "@nestjs/typeorm";
import {DataSource, Repository} from "typeorm";
import bcrypt from "bcrypt";
import {User} from "../../Entities/User/User.entity";
import {createDevice, Device} from "../../Entities/User/Device.entity";
import {CheckEntityId, findEntityBy} from "../../Utils/checkEntityId";
import {TokenBlackList} from "../../Entities/Token/TokenBlackList.entity";
import {EntityUtils} from "../../Utils/Entity.utils";

export class LoginService {
    constructor(@InjectRepository(User)
                private readonly UserRepository: Repository<User>,
                @InjectRepository(Device)
                private readonly DeviceRepository: Repository<Device>,
                @InjectRepository(TokenBlackList)
                private readonly TokenBlackListRepository: Repository<TokenBlackList>) {}

    async getMe(headAuth){
        if(!headAuth) throw new UnauthorizedException()

        const token = headAuth!.split(' ')[1]
        if(!getResultByToken(token)) throw new UnauthorizedException()
        const tokenPayload = getResultByToken(token)
        if(!tokenPayload || !tokenPayload.userId) throw new UnauthorizedException()

        const foundUser: User = await CheckEntityId
            .checkUserId(this.UserRepository, tokenPayload.userId)

        if(!foundUser) throw new HttpException('NOT FOUND', 404)
        else {
            const {email, login} = foundUser.AccountData
            return {email, login, userId: tokenPayload.userId}
        }
    }


    async login(payload, ip, headers){
        const {loginOrEmail, password} = payload

        const foundUser: User = await findEntityBy
            .findUserByEmailOrLogin(this.UserRepository, loginOrEmail)

        if(foundUser.banInfo.isBanned) throw new UnauthorizedException()

        const isValidPassword = await bcrypt
            .compare(password, foundUser.AccountData.passwordHash)

        if(isValidPassword) {
            let deviceName = headers["user-agent"]
            const deviceId = uuid.v4()

            const token = await createToken(foundUser.id, deviceId, ip,'10h')
            const RefreshToken = await createToken(foundUser.id, deviceId,ip, '20h')

            const {iat} = jwt.decode(token) as {iat: number}
            const lastActiveDate = new Date(iat * 1000).toISOString()

            const newDevice: createDevice =
                new createDevice(deviceId, ip, deviceName,
                    lastActiveDate, foundUser.id)

            await this.DeviceRepository.save(newDevice)
            return {accessToken: token, RefreshToken}
        }
        else throw new UnauthorizedException()

    }

    async logout(refreshToken){
        if (!refreshToken) throw new UnauthorizedException()
        if(!getResultByToken(refreshToken)) throw new UnauthorizedException()
        const tokenPayload = getResultByToken(refreshToken)
        if(!tokenPayload) throw new UnauthorizedException()

        await EntityUtils.checkTokenInBL(this.TokenBlackListRepository, refreshToken)

        const {userId, deviceId} = tokenPayload

        await this.DeviceRepository
            .delete({deviceId, userId})
    }

    async getRefreshToken(refreshToken) {
        if(!refreshToken) throw new UnauthorizedException()
        if(!getResultByToken(refreshToken)) throw new UnauthorizedException()

        await EntityUtils.checkTokenInBL(this.TokenBlackListRepository, refreshToken)

        const tokenPayload: any = getResultByToken(refreshToken)

        if(new Date(tokenPayload.exp * 1000) < new Date()) throw new UnauthorizedException()

        await CheckEntityId
            .checkUserId(this.UserRepository, tokenPayload.userId)

        const AccessToken = await createToken(tokenPayload.userId, tokenPayload.deviceId, tokenPayload.ip,'10h')
        const newRefreshToken = await createToken(tokenPayload.userId, tokenPayload.deviceId, tokenPayload.ip,'20h')

        const {iat} = jwt.decode(newRefreshToken) as {iat: number}

        const sessions = await EntityUtils.getAllDevices(this.DeviceRepository, tokenPayload.userId)
        const sessionForUpdate = sessions.find(s => s.deviceId === tokenPayload.deviceId)
        if(!sessionForUpdate) throw new UnauthorizedException()

        const newLastDate = sessionForUpdate.lastActiveDate = new Date(iat * 1000).toISOString()

        const {deviceId, userId} = tokenPayload

        await this.DeviceRepository
            .update({deviceId, userId},
                {lastActiveDate: newLastDate})

        return {accessToken: AccessToken, RefreshToken: newRefreshToken}
    }
}