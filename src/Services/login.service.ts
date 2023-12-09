import {HttpException, UnauthorizedException} from "@nestjs/common";
import * as uuid from 'uuid'
import jwt from "jsonwebtoken";
import {createToken, getResultByToken} from "../Utils/authentication";
import {userT} from "../Types/types";
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

        const foundUser: userT = await this.dataSource.query(`
        SELECT * FROM "Users" where id = $1
        `, [tokenPayload.userId])
        if(!foundUser) throw new HttpException('NOT FOUND', 404)
        else {
            const {email, login} = foundUser
            return {email, login, userId: tokenPayload.userId}
        }
    }


    async login(payload, ip, headers){
        const {loginOrEmail, password} = payload
        const foundUserQuery: userT = await this.dataSource.query(`
        SELECT * 
        FROM "Users" u 
        LEFT JOIN "AccountData" a ON u.id = a."userId" 
        where a."username" = $1 OR a."email" = $1
        `, [loginOrEmail])
        const foundUser = foundUserQuery[0]
        if(!foundUser) throw new UnauthorizedException()
        console.log(1)
        console.log(foundUser.passwordHash, password)
        const isValidPassword = await bcrypt.compare(password, foundUser.passwordHash,)
        console.log(isValidPassword)
        if(isValidPassword) {
            let deviceName = headers["user-agent"]
            const deviceId = uuid.v4()
            const token = await createToken(foundUser.id, deviceId, ip,'10m')
            const RefreshToken = await createToken(foundUser.id, deviceId,ip, '20m')
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
        else {
            console.log(2)
            throw new UnauthorizedException()
        }
    }

    async logout(refreshToken){
        if (!refreshToken) throw new UnauthorizedException()
        if(!getResultByToken(refreshToken)) throw new UnauthorizedException()
        const tokenPayload = getResultByToken(refreshToken)
        if(!tokenPayload) throw new UnauthorizedException()

        const {userId, deviceId} = tokenPayload

        const user = await this.dataSource.query(`
        SELECT * FROM "Users" where id = $1
        `, [userId])

        const userSessions = user.sessions.map(device => device.deviceId !== deviceId ?? device)

        await this.dataSource.query(`
        UPDATE "Users" SET sessions = $1 where id = userId
        `, [userSessions])

    }

    async getRefreshToken(refreshToken) {
        if(!refreshToken) throw new UnauthorizedException()
        if(!getResultByToken(refreshToken)) throw new UnauthorizedException()

        const tokenPayload: any = getResultByToken(refreshToken)
        if(new Date(tokenPayload.exp * 1000) < new Date()) throw new UnauthorizedException()

        const user: userT | null = await this.dataSource.query(
            `SELECT * FROM "Users" where id = $1`,
            [tokenPayload.userId])
        if (!user) throw new UnauthorizedException()

        const AccessToken = await createToken(tokenPayload.userId, tokenPayload.deviceId, tokenPayload.ip,'10s')
        const newRefreshToken = await createToken(tokenPayload.userId, tokenPayload.deviceId, tokenPayload.ip,'20s')

        const {iat} = jwt.decode(newRefreshToken) as {iat: number}
        const sessions = [...user.sessions]
        const sessionForUpdate = sessions.find(s => s.deviceId === tokenPayload.deviceId)
        if(!sessionForUpdate) throw new UnauthorizedException()
        sessionForUpdate.lastActiveDate =  new Date(iat * 1000).toISOString()
        await this.dataSource.query(
            `UPDATE "Users" SET sessions = $1 where id = $2`,
            [sessions, tokenPayload.userId])

        return {accessToken: AccessToken, RefreshToken: newRefreshToken}
    }
}