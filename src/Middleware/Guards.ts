import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {getResultByToken} from "../Utils/authentication";
import {InjectDataSource, InjectRepository} from "@nestjs/typeorm";
import {DataSource, Repository} from "typeorm";
import {CheckEntityId} from "../Utils/checkEntityId";
import {User} from "../Entities/User/User.entity";
import {Device} from "../Entities/User/Device.entity";
// import {InjectModel} from "@nestjs/mongoose";
// import {Model} from "mongoose";
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(@InjectRepository(User)
                protected UserRepository: Repository<User>,
                @InjectRepository(Device)
                protected DeviceRepository: Repository<Device>) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest()
        if(!req.headers.authorization) throw new UnauthorizedException()

        const token = req.headers.authorization.split(' ')[1]
        if(req.headers.authorization.split(' ')[0] !== 'Bearer')
            throw new UnauthorizedException()
        if(!token) throw new UnauthorizedException()
        if(!getResultByToken(token)) throw new UnauthorizedException()

        const tokenPayload = await getResultByToken(token)
        if(!tokenPayload) throw new UnauthorizedException()

        const {userId, deviceId, iat} = tokenPayload

        const foundUser = await CheckEntityId.checkUserId(this.UserRepository, userId)

        const existDevice = await this.DeviceRepository.findOneBy({deviceId, userId})

        // const correctActiveDate = foundUser.sessions.some(date => date.lastActiveDate === iat.toString())
        if(existDevice){
            req.userId = foundUser.id
            return true
        } else return false
    }

}

@Injectable()
export class BasicAuthGuard implements CanActivate {

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest()

        const headersData = req.headers.authorization
        if (headersData) {

            if(headersData === 'Basic admin:qwerty') throw new UnauthorizedException()

            const data = atob((headersData).replace('Basic ', ''))
            const login = data.split(':')[0]
            const password = data.split(':')[1]
            if (login === 'admin' && password === 'qwerty') {
                return true
            }
            else throw new UnauthorizedException()

        } else throw new UnauthorizedException()
    }
}