import {IsEmail, isString, Length} from "class-validator";

export class createUserPayloadClass {
    @Length(3, 10)
    login: string
    @IsEmail({}, { message: 'Invalid email message' })
    email: string
    @Length(6, 20)
    password: string
}

export class confirmationCode {
    @isString({code: String})
    code: string
}