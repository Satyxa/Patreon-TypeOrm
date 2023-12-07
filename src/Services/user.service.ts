import {HttpException, Injectable} from '@nestjs/common';
import {DataSource} from "typeorm";
import {InjectDataSource} from "@nestjs/typeorm";
import * as uuid from 'uuid'
import {EntityUtils} from "../Utils/EntityUtils";
import {emailAdapter} from "../Utils/email-adapter";
@Injectable()
export class UserService {
    constructor(@InjectDataSource() protected dataSource: DataSource) {}

    async getAllUsers() {
        return await this.dataSource.query(`
        SELECT "userId" as "id", "createdAt", "username" as "login", "email" 
        FROM "AccountData"`)
    }
    async getOneUser(id) {
        return await this.dataSource.query(`
        SELECT "userId" as "id", "createdAt", "username" as "login", "email" 
        FROM "AccountData" where "userId" = $1`, [id])
    }
    async createUser(payload){
        const {login, email, password} = payload
        const {AccountData, EmailConfirmation, ViewUser} = await EntityUtils.CreateUser(login, email, password)

        const {userId, username, passwordHash, createdAt} = AccountData
        const {confirmationCode, expirationDate} = EmailConfirmation
        const recoveryCode = uuid.v4()

        await this.dataSource.query(
            `INSERT INTO "Users" ("id", "recoveryCode") VALUES ($1, $2)`,
            [ViewUser.id, recoveryCode])

        await this.dataSource.query(
        `INSERT INTO "AccountData"
        ("userId", "username", "passwordHash", "email", "createdAt") VALUES ($1, $2, $3, $4, $5)`,
        [userId, username, passwordHash, AccountData.email, createdAt])

        await this.dataSource.query(`
        INSERT INTO "EmailConfirmation" ("userId", "confirmationCode", "expirationDate")
        VALUES ($1, $2, $3)`, [userId, confirmationCode, expirationDate])

        const message = `<h1>Thank for your registration</h1>
    <p>To finish registration please follow the link below:
        <a href=https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
    </p>`
        await emailAdapter.sendEmail(email, 'Confirm your email', message)

        return ViewUser
    }
    async deleteUser(id){
        return this.dataSource.query(`
        DELETE FROM "Users"
        where id = $1
        `, [id])
    }
}
