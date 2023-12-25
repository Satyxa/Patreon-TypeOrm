import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {getResultByToken} from "../Utils/authentication";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {CheckEntityId} from "../Utils/checkEntityId";
// import {InjectModel} from "@nestjs/mongoose";
// import {Model} from "mongoose";
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(@InjectDataSource() protected dataSource: DataSource) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest()
        if(!req.headers.authorization) throw new UnauthorizedException()

        const token = req.headers.authorization.split(' ')[1]
        if(!token) throw new UnauthorizedException()
        if(!getResultByToken(token)) throw new UnauthorizedException()

        const tokenPayload = await getResultByToken(token)
        if(!tokenPayload) throw new UnauthorizedException()
        const {userId, deviceId, iat} = tokenPayload
        const foundUser = await CheckEntityId.checkUserId(this.dataSource, userId)

        const existDevice = await this.dataSource.query(`
        SELECT * FROM "Sessions"
        where "deviceId" = $1 and "userId" = $2
        `, [deviceId, userId])

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
                console.log('basic guard success')
                return true
            }
            else throw new UnauthorizedException()

        } else throw new UnauthorizedException()
    }
}