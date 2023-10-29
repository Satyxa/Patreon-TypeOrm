import jwt from 'jsonwebtoken'

const secretKey = 'gergergergerg'

export const getResultByToken = (refreshToken: string) : {userId: string, deviceId: string, iat: number} | null => {
    try {
        const result =  jwt.verify(refreshToken, secretKey) as {userId: string, deviceId: string, iat: number}
        return result
    } catch (err){
        console.log(err, `=> getResultByToken (file authentication)`)
        return null
    }
}

export const createToken = async (id: string, deviceId: string, ip: string, exp: string) => {
    return jwt.sign({userId: id, ip, deviceId}, secretKey, {expiresIn: exp})

}