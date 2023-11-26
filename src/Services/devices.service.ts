import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "../Mongoose/UserSchema";
import {Model} from "mongoose";
import {HttpException, UnauthorizedException} from "@nestjs/common";
import {getResultByToken} from "../Utils/authentication";
import {SessionsType} from "../Types/types";

export class DevicesService {
    constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

    async getDevices(refreshToken){
        if(!getResultByToken(refreshToken)) throw new UnauthorizedException()
        const tokenPayload: any = getResultByToken(refreshToken)
        const foundUser: User | null = await this.UserModel.findOne({id: tokenPayload.userId})
        if(!foundUser) throw new UnauthorizedException()
        return foundUser!.sessions
    }

    async deleteDevice(deviceId, refreshToken){
        if(!getResultByToken(refreshToken)) throw new UnauthorizedException()
        const tokenPayload: any = getResultByToken(refreshToken)
        const user: User | null = await this.UserModel.findOne({'sessions.deviceId': deviceId})
        if(!user) throw new HttpException('NOT FOUND', 404)
        if(tokenPayload.userId !== user.id) throw new UnauthorizedException()
        await this.UserModel.updateOne({id: tokenPayload.userId}, {$pull: {sessions: {deviceId}}})
    }

    async deleteDevices(refreshToken, userId){
        if(!getResultByToken(refreshToken)) throw new UnauthorizedException()
        const tokenPayload = getResultByToken(refreshToken)
        if(!tokenPayload) throw new UnauthorizedException()
        const {deviceId} = tokenPayload
        await this.UserModel.updateOne({id: userId},{$pull: {sessions: {deviceId: {$ne: deviceId}}}})
    }
}