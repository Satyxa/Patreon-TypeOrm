import {IsEmail, IsNotEmpty, isString, Length, Matches} from "class-validator";

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
    @Length(0, 15)
    name: string
    @Length(0, 500)
    description: string
    @Length(0, 100)
    @Matches('^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$\n')
    websiteUrl: string
}

export class createdPostPayloadClass {
    @Length(0, 30)
    title: string
    @Length(0, 100)
    shortDescription: string
    @Length(0, 1000)
    content: string
    blogId?: string
}

export class LikeStatusClass {
    @Length(4, 7)
    likeStatus: 'Like' | 'Dislike' | 'None'
}