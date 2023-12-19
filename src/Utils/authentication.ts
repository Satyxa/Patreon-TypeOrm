import jwt from 'jsonwebtoken'
import {UnauthorizedException} from "@nestjs/common";

const secretKey = 'gergergergerg'

export const getResultByToken = (refreshToken: string) : {userId: string, deviceId: string, iat: number} | null => {
    try {
        return jwt.verify(refreshToken, secretKey) as {userId: string, deviceId: string, iat: number}
    }  catch (err){
        return null
    }
}

export const createToken = async (id: string, deviceId: string, ip: string, exp: string) => {
    return jwt.sign({userId: id, ip, deviceId}, secretKey, {expiresIn: exp})

}

export const getUserId = async (headers) => {
    let userId = ''
    if(headers.authorization){
        if(headers.authorization.split(' ')[0] === 'Basic') return userId
        const accessToken = headers.authorization.split(' ')[1]
        if(!getResultByToken(accessToken)) throw new UnauthorizedException()
        const result = getResultByToken(accessToken)
        if(result) userId = result.userId
    }
    return userId
}