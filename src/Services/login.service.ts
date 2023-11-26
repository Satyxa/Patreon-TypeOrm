import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "../Mongoose/UserSchema";
import {Model} from "mongoose";
import {UnauthorizedException} from "@nestjs/common";
import * as uuid from 'uuid'
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {createToken, getResultByToken} from "../Utils/authentication";

export class LoginService {
    constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}
    async login(payload, ip, headers){
            const {loginOrEmail, password} = payload
            const filter = {$or: [{'AccountData.email': loginOrEmail}, {'AccountData.username': loginOrEmail}]}
            const foundUser: User | null = await this.UserModel.findOne(filter)
            if(!foundUser) throw new UnauthorizedException()
            const isValidPassword = await bcrypt.compare(password, foundUser.AccountData.passwordHash)
            if(isValidPassword) {
                let deviceName = headers["user-agent"]
                const deviceId = uuid.v4()
                const token = await createToken(foundUser.id, deviceId, ip,'10s')
                const RefreshToken = await createToken(foundUser.id, deviceId,ip, '20s')
                const {iat} = jwt.decode(token) as {iat: number}
                const newDevice = {
                    ip,
                    title: deviceName,
                    deviceId,
                    lastActiveDate: new Date(iat * 1000).toISOString()
                }
                await this.UserModel.updateOne(filter, {$push: {sessions: newDevice}})
                return {accessToken: token, RefreshToken}
            }
            else throw new UnauthorizedException()
    }
    async getRefreshToken(refreshToken, ) {
        if(!refreshToken) throw new UnauthorizedException()
        if(!getResultByToken(refreshToken)) throw new UnauthorizedException()
        const tokenPayload: any = getResultByToken(refreshToken)
        if(new Date(tokenPayload.exp * 1000) < new Date()) throw new UnauthorizedException()

        const user: User | null = await this.UserModel.findOne({'id': tokenPayload.userId})
        if (!user) throw new UnauthorizedException()

        const AccessToken = await createToken(tokenPayload.userId, tokenPayload.deviceId, tokenPayload.ip,'10s')
        const newRefreshToken = await createToken(tokenPayload.userId, tokenPayload.deviceId, tokenPayload.ip,'20s')

        const {iat} = jwt.decode(newRefreshToken) as {iat: number}
        const sessions = [...user.sessions]
        const sessionForUpdate = sessions.find(s => s.deviceId === tokenPayload.deviceId)
        if(!sessionForUpdate) throw new UnauthorizedException()
        sessionForUpdate.lastActiveDate =  new Date(iat * 1000).toISOString()
        await this.UserModel.updateOne({'id': tokenPayload.userId}, {$set: {sessions}})
        return {accessToken: AccessToken, RefreshToken: newRefreshToken}
    }
}