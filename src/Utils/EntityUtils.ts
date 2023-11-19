import * as uuid from "uuid";
import {commentsT, newestLikesT, reactionsT, UserAccountDBType, userViewT} from "../Types/types";
import {User} from "../Mongoose/UserSchema";
import bcrypt from "bcrypt";

export const EntityUtils = {
    CreateUser: async (login, email, password) => {
        const id = uuid.v4()
        const confirmationCode = uuid.v4()
        const createdAt = new Date().toISOString()
        const expirationDate = new Date().toISOString()
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        const UserDB: UserAccountDBType = {
            id,
            AccountData: {
                username: login,
                email,
                passwordHash: hash,
                createdAt
            },
            EmailConfirmation: {
                confirmationCode,
                expirationDate,
                isConfirmed: false
            },
            sessions: [],
            recoveryCode: ''
        }
        const ViewUser = {
            id: UserDB.id,
            email: UserDB.AccountData.email,
            login: UserDB.AccountData.username,
            createdAt: UserDB.AccountData.createdAt
        }

        // const {sessions, recoveryCode, ...ViewUser} = UserDB

        return {UserDB, ViewUser}
    },
    GetPost: (post, userId): any => {
    return {
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
            likesCount: post.extendedLikesInfo.likesCount,
            dislikesCount: post.extendedLikesInfo.dislikesCount,
            myStatus: post.reactions.reduce((ac: string, r: reactionsT) => {
                if (r.userId === userId) {
                    return r.status
                }
                return ac
            }, 'None'),
            newestLikes: post.extendedLikesInfo.newestLikes.map((el: newestLikesT, i: number) => {
                if(i < 3) {
                    return {
                        userId: el.userId,
                        addedAt: el.addedAt,
                        login: el.login
                    };
                }
                return
            }).splice(0, 3)
        }
    }
},
    CreatePost: (title: string, shortDescription: string,
                 content: string, blogId: string, blogName: string) => {
        return {
            id: uuid.v4(),
            title,
            shortDescription,
            content,
            blogId,
            blogName,
            createdAt: new Date().toISOString(),
            comments: [],
            reactions: [],
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None',
                newestLikes: []
            }
        }
},
    createViewComment: (comment: commentsT, userId: string) => {
        return {
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            commentatorInfo: {
                userId: comment.commentatorInfo.userId,
                userLogin: comment.commentatorInfo.userLogin
            },
            likesInfo: {
                likesCount: comment.likesInfo.likesCount,
                dislikesCount: comment.likesInfo.dislikesCount,
                myStatus: comment.reactions.reduce((ac, r) => {
                    if (r.userId == userId) {
                        ac = r.status;
                        return ac
                    }
                    return ac
                }, 'None')
            }
        }
    },
    createReaction: (userId: string, status: string) => {
        return {
            userId,
            status,
            createdAt: new Date().toISOString()
        }
    },
    createNewestLike: (userId: string, login: string) => {
        return {
            userId,
            login,
            addedAt: new Date().toISOString()
        }
    },
}