import {
    Equals,
    IsEmail,
    IsIn,
    isIn, isNotEmpty,
    IsNotEmpty,
    isString,
    Length,
    Matches,
    Validate,
    ValidateIf
} from "class-validator";
import {Transform} from "class-transformer";
import {Optional} from "@nestjs/common";

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
}

export class createdPostForBlogPayloadClass {
    @Transform(param => param.value.trim())
    @Length(1, 30)
    title: string
    @Transform(param => param.value.trim())
    @Length(1, 100)
    shortDescription: string
    @Transform(param => param.value.trim())
    @Length(1, 1000)
    content: string
    @Optional()
    blogId: string
}
const availableValues = ['Like', 'Dislike', 'None']
export class LikesPayloadClass {
    @Transform(param => param.value.trim())
    @IsIn(availableValues)
    likeStatus: 'Like' | 'Dislike' | 'None'
}

export class CommentContentClass {
    @Transform(param => param.value.trim())
    @Length(20, 300)
    content: string
}

export class newPasswordPayloadClass {
    @Transform(param => param.value.trim())
    @Length(6, 20)
    newPassword: string
    @IsNotEmpty()
    recoveryCode: string
}