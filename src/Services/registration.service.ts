import {Injectable, Post, UnauthorizedException} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "../Mongoose/UserSchema";
import {Model} from "mongoose";
import {EntityUtils} from "../Utils/EntityUtils";
import bcrypt from "bcrypt";
import {emailAdapter} from "../Utils/email-adapter";

@Injectable()
export class RegistrationService {
    constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>){
    }
    async registration(payload) {
        try {
            const {email, login, password} = payload
            const {UserDB} = await EntityUtils.CreateUser(login, email, password)
            const message = `<h1>Thank for your registration</h1>
    <p>To finish registration please follow the link below:
        <a href=https://somesite.com/confirm-email?code=${UserDB.EmailConfirmation.confirmationCode}'>complete registration</a>
    </p>`
            await this.UserModel.create({...UserDB})
            await emailAdapter.sendEmail(UserDB.AccountData.email, 'Confirm your email', message)
            return {UserDB}
        } catch (err){
            console.log(err, `=> post "/registration" registrationRouter`)
            throw new UnauthorizedException()
        }
    }
}