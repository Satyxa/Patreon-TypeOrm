import {BadRequestException, HttpException, Injectable} from '@nestjs/common';
import {DataSource} from "typeorm";
import {InjectDataSource} from "@nestjs/typeorm";
import * as uuid from 'uuid'
import {EntityUtils} from "../Utils/EntityUtils";
import {emailAdapter} from "../Utils/email-adapter";
import {Users} from "../Schemes/UserSchema";
import {usersPS} from "../Utils/PaginationAndSort";

@Injectable()
export class UserService {
    constructor(@InjectDataSource() protected dataSource: DataSource) {
    }

    async deleteAll() {
        return await this.dataSource.query(`
        DELETE * FROM "Users"
        `)
    }

    async getAllUsers(payload) {

        const {users, pagesCount, pageNumber, pageSize, totalCount} = await usersPS(this.dataSource, payload)

        return ({
            pagesCount, page: pageNumber, pageSize,
            totalCount, items: users})
    }

    async getOneUser(id) {
        return await this.dataSource.query(`
        SELECT "id", "createdAt", "username" as "login", "email" 
        FROM "Users" where id = $1`, [id])
    }

    async createUser(payload) {
        const {login, email, password} = payload

        const userByLogin = await this.dataSource.query(`
        SELECT * FROM "Users" where username = $1
        `, [login])
        const userByEmail = await this.dataSource.query(`
        SELECT * FROM "Users" where email = $1
        `, [email])

        if (userByEmail.length || userByLogin.length) throw new BadRequestException([{
            message: 'email or login already exist',
            field: userByLogin ? 'login' : 'email'
        }])

        const {AccountData, EmailConfirmation, ViewUser} = await EntityUtils.CreateUser(login, email, password)

        const {username, passwordHash, createdAt} = AccountData
        const {confirmationCode, expirationDate} = EmailConfirmation
        const recoveryCode = uuid.v4()


        await this.dataSource.query(
            `INSERT INTO "Users" ("id", "recoveryCode", "username", "passwordHash", "email", 
                "createdAt", "confirmationCode", "expirationDate") 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [ViewUser.id, recoveryCode, username, passwordHash,
                email, createdAt, confirmationCode, expirationDate])

        const message = `<h1>Thank for your registration</h1>
    <p>To finish registration please follow the link below:
        <a href=https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
    </p>`
        await emailAdapter.sendEmail(email, 'Confirm your email', message)

        return ViewUser
    }

    async deleteUser(id) {
        return this.dataSource.query(`
        DELETE FROM "Users"
        where id = $1
        `, [id])
    }
}
