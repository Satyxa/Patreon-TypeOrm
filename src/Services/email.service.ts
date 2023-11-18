import {BadRequestException, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "../Mongoose/UserSchema";
import {Model} from "mongoose";
import {findUserByLoginOrEmail} from "../Utils/authentication";
import {emailAdapter} from "../Utils/email-adapter";
import * as uuid from 'uuid'
@Injectable()
export class EmailService {
    constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>){
    }
    async confirmEmail(payload) {
        const {code} = payload
        if(!code) throw new BadRequestException([{message: 'code is required', field: "code"}])
        const user: User | null = await this.UserModel.findOne({"EmailConfirmation.confirmationCode": code})
        if(!user) throw new BadRequestException([{message: 'invalid code', field: "code"}])
        if (user.EmailConfirmation.isConfirmed) throw new BadRequestException([{ message: 'already confirmed', field: "code" }])

        await this.UserModel.updateOne({"EmailConfirmation.confirmationCode": code}, {
            $set: {"EmailConfirmation.isConfirmed": true}})

    }
    async confirmationCodeResending(payload) {
        const {email} = payload
        if(!email) throw new BadRequestException([{message: 'email is required', field: "email"}])
        const user: User | null = await findUserByLoginOrEmail(email, this.UserModel)
        if(!user) throw new BadRequestException([{message: 'this email does not exist', field: "email"}])
        if(user.EmailConfirmation.isConfirmed) throw new BadRequestException([{ message: 'already confirmed', field: "email" }])
        const newCode = uuid.v4()
        user.EmailConfirmation.confirmationCode = newCode
        await this.UserModel.updateOne({'AccountData.email': email}, {$set: {...user}})
        const message = `<h1>Thank for your registration</h1>
    <p>To finish registration please follow the link below:
        <a href=https://somesite.com/confirm-email?code=${newCode}>complete registration</a>
    </p>`
        await emailAdapter.sendEmail(email, 'email confirmation', message)
    }
}