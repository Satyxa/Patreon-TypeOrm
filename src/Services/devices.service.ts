import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "../Mongoose/UserSchema";
import {Model} from "mongoose";
import {HttpException, UnauthorizedException} from "@nestjs/common";
import {createToken, getResultByToken} from "../Utils/authentication";
import bcrypt from "bcrypt";
import * as uuid from "uuid";
import jwt from "jsonwebtoken";

export class DevicesService {
    constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

    async getDevices(){
        const foundUser: User = await this.UserModel.findOne({id: req.userId})
        return foundUser!.sessions
    }

    async deleteDevice(deviceId, userId){
        const user: User | null = await this.UserModel.findOne({'sessions.deviceId': deviceId})
        if(!user) throw new HttpException('NOT FOUND', 404)
        if(userId !== user.id) throw new HttpException('FORBIDDEN', 403)
        await this.UserModel.updateOne({id: userId}, {$pull: {sessions: {deviceId}}})
    }

    async deleteDevices(refreshToken, userId){
        if(!getResultByToken(refreshToken)) throw new UnauthorizedException()
        const tokenPayload = getResultByToken(refreshToken)
        if(!tokenPayload) throw new UnauthorizedException()
        const {deviceId} = tokenPayload
        await this.UserModel.updateOne({id: userId},{$pull: {sessions: {deviceId: {$ne: deviceId}}}})
    }
}