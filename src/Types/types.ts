import * as uuid from "uuid";

export type userT33 = {
    id: string
    email: string
    login: string
    passwordHash: string
    passwordSalt: string
    createdAt: string
}
export type userT = {
    id: string
    email: string
    login: string
    password: string
    createdAt: string
    sessions: SessionsType[]
}

export type errorField = {
    field: string
    message: string
}

export interface UserSQL {
    id: string
    recoveryCode: string
    username: string
    email: string
    passwordHash: string
    createdAt: string
    confirmationCode: string
    expirationDate: string
    isConfirmed: boolean
}


export type AccountDataType = {
    userId: string
    username: string
    email: string
    passwordHash: string
    createdAt: string
}

export type EmailConfirmationType = {
    userId: string
    confirmationCode: string
    expirationDate: string
    isConfirmed: boolean
}

export type SessionsType = {
    ip: string
    title: string
    deviceId: string
    lastActiveDate: string
}


export type UserAccountDBType = {
    id: string
    AccountData: AccountDataType
    EmailConfirmation: EmailConfirmationType
    sessions: SessionsType[]
    recoveryCode: string
}

export type userLoginT = {
    password: string
    loginOrEmail: string
}

export type userViewT = {
    id: string,
    AccountData: AccountDataType,
    EmailConfirmation: EmailConfirmationType
}

export type pagSortT = {
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    searchNameTerm: string,
    totalCount: number,
    pagesCount: number
}


export type RateLimiterT = {
    ip: string
    date: Date
    url: string
}

export type postT = {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
    comments: commentsT[]
    reactions: reactionsT[]
    extendedLikesInfo: extendedLikesInfoT
}

export type extendedLikesInfoT = {
    likesCount: number,
    dislikesCount: number,
    myStatus: string,
    newestLikes: newestLikesT[]
}

export type newestLikesT = {
    _id?: string,
    addedAt: string,
    userId: string,
    login: string
}

export type commentsT = {
    id: string
    commentatorInfo: commentatorInfoT
    content: string
    createdAt: string
    postId: string
    likesInfo: likesInfoT
    reactions: reactionsT[]
}

export type reactionsT = {
    userId: string,
    status: string,
    createdAt: string
}

export type likesInfoT = {
    likesCount: number,
    dislikesCount: number,
    myStatus: 'None' | 'Like' | 'Dislike'
}

export type commentatorInfoT = {
    userId: string
    userLogin: string
}

export type blogsT = {
    id: string
    name: string
    description: string
    websiteUrl: string
    isMembership: boolean
    createdAt: string
}

export type videoT = {
    id: number
    title: string
    author: string
    canBeDownloaded: boolean
    minAgeRestriction: number | null
    createdAt: string
    publicationDate: string
    availableResolutions: Array<'P144' | 'P240' | 'P360' | 'P480' | 'P720' | 'P1080' | 'P1440' | 'P2160'>
}

export type updatedVideoType = {
    id: number,
    title: string,
    author: string,
    canBeDownloaded: boolean,
    minAgeRestriction: number | null,
    createdAt: string,
    publicationDate: string,
    availableResolutions: Array<string>
}

export type ValidationErrorType = {
    message: string
    field: string
}

export type rateLimitT = {
    ip: string
    url: string
    date: string
}

export type createUserPayloadType = {
    login: string
    email: string
    password: string
}

export type ErrorsType = {
    field: string
    message: string
}