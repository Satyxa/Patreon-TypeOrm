import * as uuid from "uuid";
import {
    commentsReactionsT,
    commentsSQL,
    commentsT,
    newestLikesT,
    postT,
    reactionsT,
    UserAccountDBType,
    userViewT
} from "../Types/types";
import bcrypt from "bcrypt";
import {DataSource} from "typeorm";

export const EntityUtils = {
    CreateUser: async (login, email, password) => {
        const id = uuid.v4()
        const confirmationCode = uuid.v4()
        const createdAt = new Date().toISOString()
        const expirationDate = new Date().toISOString()
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        const User = {
            id,
            recoveryCode: ''
        }
        const AccountData = {
            userId: id,
            username: login,
            email,
            passwordHash: hash,
            createdAt
        }
        const EmailConfirmation = {
            userId: id,
            confirmationCode,
            expirationDate,
            isConfirmed: false
        }
        const ViewUser = {
            id: User.id,
            email: AccountData.email,
            login: AccountData.username,
            createdAt: AccountData.createdAt
        }

        return {AccountData, EmailConfirmation, ViewUser}
    },
    GetPost: (post: postT, userId, reactions, newestLikes): any => {

        const newestLikesForPost = newestLikes.filter(el => el.postId === post.id).reverse()
        const reactionsForPost = reactions.filter(el => el.postId === post.id)

        return {
            id: post.id,
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt,
            extendedLikesInfo: {
                likesCount: +post.likesCount,
                dislikesCount: +post.dislikesCount,
                myStatus: reactionsForPost.reduce((ac: string, r: reactionsT) => {
                    if (r.userId === userId && r.postId === post.id ) {
                        return r.status
                    }
                    return ac
                }, 'None'),
                newestLikes: newestLikesForPost.map((el: newestLikesT, i: number) => {
                    if (i < 3) {
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
    CreatePost: async (title: string, shortDescription: string,
                 content: string, blogId: string, blogName: string,
                 dataSource: DataSource) => {
        const createdAt = new Date().toISOString()
        const id = uuid.v4()
        await dataSource.query(`
        INSERT INTO "Posts" ("id", "title", "shortDescription",
                "content", "blogId", "blogName", "createdAt",
                "likesCount", "dislikesCount", "myStatus")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [id, title, shortDescription, content, blogId,
            blogName, createdAt, 0, 0, 'None'])
        return {
            id,
            title,
            shortDescription,
            content,
            blogId,
            blogName,
            createdAt,
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None',
                newestLikes: []
            }
        }
    },
    createViewComment: (comment: commentsSQL, userId: string, reactions: commentsReactionsT[]) => {
        return {
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            commentatorInfo: {
                userId: comment.userId,
                userLogin: comment.userLogin
            },
            likesInfo: {
                likesCount: +comment.likesCount,
                dislikesCount: +comment.dislikesCount,
                myStatus: reactions.reduce((ac, r) => {
                    if (r.userId === userId && r.commentId === comment.id) {
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
    createBlog: (id, name, description, websiteUrl,
                 createdAt) => {
        return {
            id,
            name,
            description,
            websiteUrl,
            isMembership: false,
            createdAt
        }
    }
}
