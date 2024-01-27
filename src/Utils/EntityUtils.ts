import * as uuid from "uuid";
import {
    commentsReactionsT,
    newestLikesT,
    reactionsT,
} from "../Types/types";
import bcrypt from "bcrypt";
import {UnauthorizedException} from "@nestjs/common";
import {createPost} from "../Entities/Posts/PostEntity";
import {createELI} from "../Entities/Posts/ExtendedLikesInfoEntity";
import {createLI} from "../Entities/Comment/LikesInfoEntity";
import {createAC} from "../Entities/User/AccountDataEntity";
import {createEC} from "../Entities/User/EmailConfirmationEntity";
import {createUser} from "../Entities/User/UserEntity";
import {createCI} from "../Entities/Comment/CommentatorInfoEntity";
import {createComment} from "../Entities/Comment/CommentEntity";
import {createQuestionForPP, Question} from "../Entities/Quiz/QuestionEntity";

export const EntityUtils = {
    CreateUser: async (login, email, password) => {
        const id = uuid.v4()
        const confirmationCode = uuid.v4()
        const createdAt = new Date().toISOString()
        const expirationDate = new Date().toISOString()
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)

        const AccountData: createAC = new createAC(hash, login, email, createdAt, id)
        const EmailConfirmation: createEC = new createEC(expirationDate, confirmationCode, id)
        const User: createUser = new createUser(id, AccountData, EmailConfirmation)

        const ViewUser = {id, email, login, createdAt}

        return {User, AccountData, EmailConfirmation, ViewUser}
    },

    CreateComment: async (content, postId, userId, userLogin, commentId, createdAt) => {
        const LikesInfo: createLI = new createLI(commentId)
        const CommentatorInfo: createCI = new createCI(userId, userLogin, commentId)
        const Comment: createComment = new createComment(commentId, content,
            CommentatorInfo, LikesInfo, createdAt, postId)

        return {Comment, CommentatorInfo, LikesInfo}
    },
    GetPost: (post, newestLikes, reactions, extendedLikesInfo, userId): any => {
        const NLForPost = newestLikes.filter(el => el.postId.postId === post.id)
        const REACTForPost = reactions.filter(el => el.entityId === post.id)
        const ELIForPost = extendedLikesInfo.filter(el => el.postId === post.id)

        return {
            id: post.id,
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blog.id,
            blogName: post.blogName,
            createdAt: post.createdAt,
            extendedLikesInfo: {
                likesCount: ELIForPost[0] ? ELIForPost[0].likesCount : 0,
                dislikesCount: ELIForPost[0] ? ELIForPost[0].dislikesCount : 0,
                myStatus: REACTForPost.reduce((ac: string, r: reactionsT) => {
                    if (r.userId === userId &&
                        r.entityId === post.id) return r.status

                    return ac
                }, 'None'),
                newestLikes: NLForPost.map((el: newestLikesT, i: number) => {
                    if (i < 3) return {
                            userId: el.userId,
                            addedAt: el.addedAt,
                            login: el.login
                        };
                    return
                }).splice(0, 3)
            }
        }
    },
    CreatePost: async (PostRepository, ExtendedLikesInfoRepository,
                       title: string, shortDescription: string,
                       content: string, blog, blogName: string) => {
        const createdAt = new Date().toISOString()
        const id = uuid.v4()

        const ExtendedLikesInfo: createELI = new createELI(id)
        const Post: createPost = new createPost(id, title, shortDescription,
            content, createdAt, blogName, blog, ExtendedLikesInfo)

        await ExtendedLikesInfoRepository.save(ExtendedLikesInfo)
        await PostRepository.save(Post)

        return EntityUtils.GetPost(Post, [], [], [], '')
    },
    createViewComment: (comment, userId: string, reactions: commentsReactionsT[]) => {
        return {
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            commentatorInfo: {
                userId: comment.CommentatorInfo.userId,
                userLogin: comment.CommentatorInfo.userLogin
            },
            likesInfo: {
                likesCount: comment.LikesInfo.likesCount,
                dislikesCount: comment.LikesInfo.dislikesCount,
                myStatus: reactions.reduce((ac, r) => {
                    if (r.userId === userId && r.entityId === comment.id) {
                        ac = r.status;
                        return ac
                    }
                    return ac
                }, 'None')
            }
        }
    },
    checkTokenInBL: async (TokenBlackListRepository, refreshToken) => {
        const isTokenInBL = await TokenBlackListRepository
            .createQueryBuilder("t")
            .where("t.token = :token", {token: refreshToken})
            .getOne()
        if(isTokenInBL) throw new UnauthorizedException()
        else await TokenBlackListRepository.save({
            token: refreshToken
        })
    },

    getAllDevices: async (DeviceRepository, userId) => {
        return await DeviceRepository
            .createQueryBuilder("d")
            .select(["d.deviceId", "d.lastActiveDate", "d.ip", "d.title"])
            .where("d.userId = :userId", {userId})
            .getMany()
    },
}
