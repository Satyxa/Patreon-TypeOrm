import {BadRequestException, HttpException, Injectable} from '@nestjs/common';
import {DataSource, Repository} from "typeorm";
import {InjectDataSource, InjectRepository} from "@nestjs/typeorm";
import * as uuid from 'uuid'
import {EntityUtils} from "../Utils/EntityUtils";
import {emailAdapter} from "../Utils/email-adapter";
import {usersPS} from "../Utils/PaginationAndSort";
import {UserSQL} from "../Types/types";
import {User} from "../Entities/User/UserEntity";
import {AccountData} from "../Entities/User/AccountDataEntity";
import {EmailConfirmation} from "../Entities/User/EmailConfirmationEntity";
import {CheckEntityId, findEntityBy} from "../Utils/checkEntityId";
import {EMAIL_CONF_MESSAGE} from "../Constants";
import { Player } from '../Entities/Quiz/PlayerEntity';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User)
                private readonly UserRepository: Repository<User>,
                @InjectRepository(AccountData)
                private readonly AccountDataRepository: Repository<AccountData>,
                @InjectRepository(EmailConfirmation)
                private readonly EmailConfirmationRepository: Repository<EmailConfirmation>,
                @InjectRepository(Player)
                private readonly PlayerRepository: Repository<Player>,
                @InjectDataSource() private readonly dataSource: DataSource,) {
    }

    async deleteAll() {
        await this.dataSource.query(`
         UPDATE "user" SET "deleted" = true
         WHERE "deleted" = false`)
        return
    }

    async getAllUsers(payload) {
        const {users, pagesCount, pageNumber, pageSize, totalCount} = await usersPS(this.UserRepository, payload)
        return ({
            pagesCount, page: pageNumber, pageSize,
            totalCount, items: users})
    }

    // async getOneUser(id) {
    //     return await this.dataSource.query(`
    //     SELECT "id", "createdAt", "username" as "login", "email"
    //     FROM "Users" where id = $1`, [id])
    // }

    async createUser(payload) {

        const {login, email, password} = payload
        await findEntityBy
            .findUserByLoginAndEmail(this.UserRepository, login, 'login', 400)
        await findEntityBy
            .findUserByLoginAndEmail(this.UserRepository, email, 'email', 400)

        const {User, AccountData, EmailConfirmation, ViewUser} = await EntityUtils.CreateUser(login, email, password)

        await this.AccountDataRepository.save(AccountData)
        await this.EmailConfirmationRepository.save(EmailConfirmation)
        await this.UserRepository.save(User)

        await this.PlayerRepository.save({
            id: User.id,
            login: AccountData.login
        })

        await emailAdapter.sendEmail(email, 'Confirm your email',
            EMAIL_CONF_MESSAGE(EmailConfirmation.confirmationCode))

        return ViewUser
    }

    async deleteUser(id) {
        await CheckEntityId.checkUserId(this.UserRepository, id)
        return this.UserRepository
            .update({id}, {deleted: true})
    }
}
