import {IsEmail, IsNotEmpty, isString, Length, Matches} from "class-validator";
import {Transform} from "class-transformer";

export class createUserPayloadClass {
    @Length(3, 10)
    login: string
    @IsEmail({}, { message: 'Invalid email message' })
    email: string
    @Length(6, 20)
    password: string
}

export class confirmationCodeClass {
    @IsNotEmpty()
    code: string
}

export class emailClass {
    @IsNotEmpty()
    email: string
}

export class createBlogPayloadClass {
    @Transform(param => param.value.trim())
    @Length(1, 15)
    name: string
    @Length(1, 500)
    description: string
    @Length(1, 100)
    @Matches('^https://([a-zA-Z0-9_-]+.)+[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*/?$', '')
    websiteUrl: string
}

export class createdPostPayloadClass {
    @Transform(param => param.value.trim())
    @Length(1, 30)
    title: string
    @Transform(param => param.value.trim())
    @Length(1, 100)
    shortDescription: string
    @Transform(param => param.value.trim())
    @Length(1, 1000)
    content: string
    blogId?: string
}

export class LikeStatusClass {
    @Length(4, 7)
    likeStatus: 'Like' | 'Dislike' | 'None'
}