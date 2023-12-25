import {HttpException, UnauthorizedException} from "@nestjs/common";
import * as uuid from 'uuid'
import jwt from "jsonwebtoken";
import {createToken, getResultByToken} from "../Utils/authentication";
import {UserSQL, userT} from "../Types/types";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import bcrypt from "bcrypt";

export class LoginService {
    constructor(@InjectDataSource() protected dataSource: DataSource) {}

    async getMe(headAuth){
        if(!headAuth) throw new UnauthorizedException()

        const token = headAuth!.split(' ')[1]
        if(!getResultByToken(token)) throw new UnauthorizedException()
        const tokenPayload = getResultByToken(token)
        if(!tokenPayload || !tokenPayload.userId) throw new UnauthorizedException()

        const foundUser: UserSQL[] = await this.dataSource.query(`
        SELECT * FROM "Users" where id = $1
        `, [tokenPayload.userId])

        if(!foundUser.length) throw new HttpException('NOT FOUND', 404)
        else {
            const {email, username} = foundUser[0]
            return {email, login: username, userId: tokenPayload.userId}
        }
    }


    async login(payload, ip, headers){
        const {loginOrEmail, password} = payload
        const foundUserQuery: UserSQL[] = await this.dataSource.query(`
        SELECT * FROM "Users"
        where username = $1 OR email = $1
        `, [loginOrEmail])
        const foundUser = foundUserQuery[0]

        if(!foundUser) throw new UnauthorizedException()
        const isValidPassword = await bcrypt.compare(password, foundUser.passwordHash)

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
            const{title, lastActiveDate} = newDevice
            await this.dataSource.query(`
            INSERT INTO "Sessions" ("userId", "deviceId", "ip", "lastActiveDate", "title")
            VALUES ($1, $2, $3, $4, $5)
            `, [foundUser.id, deviceId, ip, lastActiveDate, title])
            return {accessToken: token, RefreshToken}
        }
        else throw new UnauthorizedException()

    }

    async logout(refreshToken){
        if (!refreshToken) throw new UnauthorizedException()
        if(!getResultByToken(refreshToken)) throw new UnauthorizedException()
        const tokenPayload = getResultByToken(refreshToken)
        if(!tokenPayload) throw new UnauthorizedException()

        const isTokenInBL = await this.dataSource.query(`
        SELECT * FROM "BlackListTokens" where token = $1
        `, [refreshToken])
        if(isTokenInBL.length) throw new UnauthorizedException()

        const {userId, deviceId} = tokenPayload

        await this.dataSource.query(`
        INSERT INTO "BlackListTokens" ("token")
        VALUES ($1)`, [refreshToken])

        await this.dataSource.query(`
        DELETE FROM "Sessions" 
        where "userId" = $1 
        AND "deviceId" = $2`, [userId, deviceId])

    }

    async getRefreshToken(refreshToken) {
        if(!refreshToken) throw new UnauthorizedException()
        if(!getResultByToken(refreshToken)) throw new UnauthorizedException()

        const isTokenInBL = await this.dataSource.query(`
        SELECT * FROM "BlackListTokens" where token = $1
        `, [refreshToken])
        if(isTokenInBL.length) throw new UnauthorizedException()

        await this.dataSource.query(`
        INSERT INTO "BlackListTokens" ("token")
        VALUES ($1)`, [refreshToken])

        const tokenPayload: any = getResultByToken(refreshToken)

        if(new Date(tokenPayload.exp * 1000) < new Date()) throw new UnauthorizedException()

        const user: UserSQL[] = await this.dataSource.query(
            `SELECT * FROM "Users" where id = $1`,
            [tokenPayload.userId])
        if (!user.length) throw new UnauthorizedException()

        const AccessToken = await createToken(tokenPayload.userId, tokenPayload.deviceId, tokenPayload.ip,'10h')
        const newRefreshToken = await createToken(tokenPayload.userId, tokenPayload.deviceId, tokenPayload.ip,'20h')

        const {iat} = jwt.decode(newRefreshToken) as {iat: number}
        const sessions = await this.dataSource.query(
        `SELECT * FROM "Sessions" where "userId" = $1`,
        [tokenPayload.userId])
        const sessionForUpdate = sessions.find(s => s.deviceId === tokenPayload.deviceId)
        if(!sessionForUpdate) throw new UnauthorizedException()

        const newLastDate = sessionForUpdate.lastActiveDate = new Date(iat * 1000).toISOString()
        await this.dataSource.query(
            `UPDATE "Sessions" SET "lastActiveDate" = $1 
            where "userId" = $2 AND "deviceId" = $3`,
            [newLastDate, tokenPayload.userId, tokenPayload.deviceId])

        return {accessToken: AccessToken, RefreshToken: newRefreshToken}
    }
}