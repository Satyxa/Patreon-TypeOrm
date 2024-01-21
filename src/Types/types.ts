
export type userT = {
    id: string
    email: string
    login: string
    password: string
    createdAt: string
    sessions: SessionsType[]
}

export interface FoundedUser {
    id: string
    recoveryCode: string
    AccountData: AccountDataType
    EmailConformation: EmailConfirmationType
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

export type commentsSQL = {
    content: string
    createdAt: string
    postId: string
    id: string
    CommentatorInfo: commentatorInfoT
    LikesInfo: likesInfoT
    deleted: boolean
}

export type reactionsT = {
    entityId: string
    userId: string,
    status: string,
    createdAt: string
}
export type commentsReactionsT = {
    userId: string,
    status: string,
    createdAt: string
    entityId: string
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

export type ErrorsType = {
    field: string
    message: string
}