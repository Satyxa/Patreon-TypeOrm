import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {BadRequestException} from "@nestjs/common";
import * as uuid from 'uuid'
import {emailAdapter} from "../Utils/email-adapter";
import bcrypt from "bcrypt";
import {EMAIL_CONF_SEND_MESSAGE, PASS_REC_MESSAGE} from "../Constants";
import {findEntityBy} from "../Utils/checkEntityId";
import {AccountData} from "../Entities/User/AccountDataEntity";
import {User} from "../Entities/User/UserEntity";
import { EmailConfirmation } from '../Entities/User/EmailConfirmationEntity';

export class EmailService {
    constructor(@InjectRepository(AccountData)
    private readonly AccountDataRepository: Repository<AccountData>,
                @InjectRepository(User)
    private readonly UserRepository: Repository<User>,
                @InjectRepository(EmailConfirmation)
    private readonly EmailConfirmationRepository: Repository<EmailConfirmation>) {}

    async confirmEmail(payload) {
        return
    // const { code } = payload;
    //     if(!code) throw new BadRequestException([{message: 'code is required', field: "code"}])
    //
    //     const User: User | null = await this.UserRepository
    //         .createQueryBuilder("u")
    //         .leftJoinAndSelect("u.EmailConfirmation", "em")
    //         .where("em.confirmationCode = :code", {code})
    //         .getOne()
    //
    //     if(!User) throw new BadRequestException([{message: 'invalid code', field: "code"}])
    //     if(User.deleted) throw new BadRequestException([{message: 'user deleted', field: "code"}])
    //     if (User.EmailConfirmation.isConfirmed) throw new BadRequestException([{ message: 'already confirmed', field: "code" }])
    //
    //     await this.EmailConfirmationRepository.update({confirmationCode: code}, {isConfirmed: true})
    }
    async confirmationCodeResending(payload) {
        return
        // const {email} = payload
        // if(!email) throw new BadRequestException([{message: 'email is required', field: "email"}])
        //
        // const user: User = await findEntityBy
        //     .findUserByLoginAndEmail(this.UserRepository, email,
        //         'email', 400, 'emailRes')
        //
        // if(user.EmailConfirmation.isConfirmed) throw new BadRequestException(
        //     [{ message: 'already confirmed', field: "email" }])
        //
        // const newCode = uuid.v4()
        //
        // await this.EmailConfirmationRepository
        //     .update({userId: user.id}, {confirmationCode: newCode})
        //
        // await emailAdapter.sendEmail(email, 'email confirmation', EMAIL_CONF_SEND_MESSAGE(newCode))
    }

    async recoveryCode(email) {
        return
        // const User: User = await findEntityBy
        //     .findUserByLoginAndEmail(this.UserRepository, email,
        //         'email', 404)
        //
        // if(!User )throw new BadRequestException(
        //     [{message: 'user with that email does not exist', field: "email"}])
        // else {
        //     const recoveryCode = uuid.v4()
        //     const {userId} = User.AccountData
        //
        //     await this.UserRepository.createQueryBuilder("u")
        //         .update("u.recoveryCode = :recoveryCode", {recoveryCode})
        //         .where("u.id = :userId", {userId})
        //
        //     const subject = 'Password Recovery'
        //     await emailAdapter.sendEmail(email, subject, PASS_REC_MESSAGE(recoveryCode))
        // }
    }

    async getNewPassword(payload) {
        const {newPassword, recoveryCode} = payload
        if(!recoveryCode) throw new BadRequestException(
            [{message: 'recoveryCode is required', field: "recoveryCode"}])

        const newRecoveryCode = uuid.v4()
        const passwordSalt = await bcrypt.genSalt(10)
        const newPasswordHash = await bcrypt.hash(newPassword, passwordSalt)

        await this.UserRepository.createQueryBuilder("u")
            .leftJoinAndSelect("u.AccountData", "ac")
            .update("ac.passwordHash = :newPasswordHash, u.recoveryCode = :newRecoveryCode",
                {newPasswordHash, newRecoveryCode})
            .where("u.recoveryCode = :recoveryCode", {recoveryCode})
    }
}