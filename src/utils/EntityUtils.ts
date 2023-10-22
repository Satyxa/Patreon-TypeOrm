import * as uuid from "uuid";
import {newestLikesT, reactionsT, UserAccountDBType, userViewT} from "../types";
import {User} from "../Mongoose/UserSchema";

export const EntityUtils = {
    CreateUser: (login, email, passwordHash, id, createdAt, expirationDate, confirmationCode) => {

        const UserDB: UserAccountDBType = {
            id,
            AccountData: {
                username: login,
                email,
                passwordHash,
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

        const {sessions, recoveryCode, ...ViewUser} = UserDB

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
}
}