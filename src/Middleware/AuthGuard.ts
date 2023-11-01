import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "../Mongoose/UserSchema";
import {Model} from "mongoose";
import {getResultByToken} from "../Utils/authentication";
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest()
        if(!req.headers.authorization) throw new UnauthorizedException()
        const token = req.headers.authorization.split(' ')[1]
        if(!token) throw new UnauthorizedException()
        if(!getResultByToken(token)) throw new UnauthorizedException()

        const tokenPayload = await getResultByToken(token)
        if(!tokenPayload) throw new UnauthorizedException()
        const {userId} = tokenPayload
        const foundUser = await this.UserModel.findOne({id:userId}).lean()
        if(!foundUser) throw new UnauthorizedException()
        else return true
        // const existDevice = foundUser.sessions.some(device => device.deviceId === deviceId)
        // const correctActiveDate = foundUser.sessions.some(date => date.lastActiveDate === iat.toString())
        // if(existDevice || correctActiveDate){
        //     req.userId = foundUser.id
        //     return true
        // }
        // else return false
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

            if (login === 'admin' && password === 'qwerty') return true
            else throw new UnauthorizedException()

        } else throw new UnauthorizedException()
    }
}