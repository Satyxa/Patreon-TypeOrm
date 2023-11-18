import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "../Mongoose/UserSchema";
import {Model} from "mongoose";
import {UnauthorizedException} from "@nestjs/common";
import * as uuid from 'uuid'
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {createToken} from "../Utils/authentication";

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
                const token = await createToken(foundUser.id, deviceId, ip,'10h')
                const RefreshToken = await createToken(foundUser.id, deviceId,ip, '20h')
                const {iat} = jwt.decode(token) as {iat: number}
                const newDevice = {
                    ip,
                    title: deviceName,
                    deviceId,
                    lastActiveDate: new Date(iat * 1000).toISOString()
                }
                await this.UserModel.updateOne(filter, {$push: {sessions: newDevice}})
                // res.cookie('refreshToken', RefreshToken, {httpOnly: true,secure: true})
                return {accessToken: token, RefreshToken}
            } else {
                throw new UnauthorizedException()
            }
    }
}