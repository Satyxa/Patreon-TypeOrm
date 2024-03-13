import * as uuid from "uuid";
import {
    commentsReactionsT,
    newestLikesT,
    reactionsT,
} from "../Types/types";
import bcrypt from "bcrypt";
import {UnauthorizedException} from "@nestjs/common";
import {createPost} from "../Entities/Posts/Post.entity";
import {createELI} from "../Entities/Posts/ExtendedLikesInfo.entity";
import {createLI} from "../Entities/Comment/LikesInfo.entity";
import {createAC} from "../Entities/User/AccountData.entity";
import {createEC} from "../Entities/User/EmailConfirmation.entity";
import {createUser} from "../Entities/User/User.entity";
import {createCI} from "../Entities/Comment/CommentatorInfo.entity";
import {createComment} from "../Entities/Comment/Comment.entity";
import {createQuestionForPP, Question} from "../Entities/Quiz/Question.entity";
import { UserAnswers } from '../Entities/Quiz/UserAnswers.entity';
import { createViewPlayerProgress, PlayerProgress } from '../Entities/Quiz/PlayerProgress.entity';
import { createBanInfo } from '../Entities/User/BanInfo.entity';
import { In } from 'typeorm';
import { createViewImageInfo, ImageInfo } from '../Entities/Blog/Images/ImageInfo.entity';
import { createPostViewImageInfo, PostImageInfo } from '../Entities/Posts/ImageInfo.entity';

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
        const BanInfo: createBanInfo = new createBanInfo(null, id)

        const ViewUser = {id, email, login, createdAt, banInfo: {
                banReason: BanInfo.banReason,
                banDate: BanInfo.banDate,
                isBanned: BanInfo.isBanned
            }}

        const User: createUser = new createUser(id, AccountData, EmailConfirmation, BanInfo)

        return {User, AccountData, EmailConfirmation, ViewUser, BanInfo}
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

        let main: createPostViewImageInfo[] = [];

        if(post.images){
            post.images.map((i: PostImageInfo) => {
                if(i.type === 'small') {
                    const small =
                      new createPostViewImageInfo(i.url, i.height, i.width, i.fileSize);
                    main.push(small)
                }
                else if(i.type === 'middle') {
                    const middle =
                      new createPostViewImageInfo(i.url, i.height, i.width, i.fileSize);
                    main.push(middle)
                }
                else if(i.type === 'original'){
                    const original =
                      new createPostViewImageInfo(i.url, i.height, i.width, i.fileSize);
                    main.push(original)
                }
            })
            post.images.main = main
        }

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
            },
            images: { main }
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
    createViewComment: (comment, userId: string, reactions: commentsReactionsT[], postInfo: any[] | null = null) => {
        console.log(comment);
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
            },
            postInfo: postInfo ? postInfo.find(p => p.id === comment.postId) : null
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
    createPlayer: (userId, gameId, login) => {
        const id = uuid.v4()
        return {
            playerId: uuid.v4(),
            userId,
            gameId,
            login,
            score: 0
        }
    },

    getAnswers: (correctAnswers, questionId) => {
        return correctAnswers.map(a => {
            return {
                id: uuid.v4(),
                answer: a,
                questionId
            }
        })
    },

    getPlayerProgress: async (PlayerProgressRepository, fppId, userAnswers: UserAnswers[] = []) => {
        const pp: PlayerProgress = await PlayerProgressRepository
          .createQueryBuilder("pp")
          .leftJoinAndSelect('pp.player', 'pl')
          .select(['pp.score', 'pl', 'pp.ppId'])
          //@ts-ignore
          .where('pp.ppId = :fppId', {fppId})
          .getOne()

        return new createViewPlayerProgress(pp.score, userAnswers, pp.player)
    },

    createNewStatistic: (userId, player) => {
        return {
            userId,
            avgScores: 0,
            sumScore: 0,
            gamesCount: 0,
            winsCount: 0,
            lossesCount: 0,
            drawsCount: 0,
            player
        }
    },


    getAllUserReactionsId: async (userId, Repository, likeStatus) => {
        const result = await Repository
          .createQueryBuilder('r')
          .where('r.userId = :userId', {userId})
          .andWhere('r.status = :likeStatus', {likeStatus})
          .getMany()
        return result.map(res => res.entityId)
    },

    changePostsReactions: async (PostLikesRepository, postsId, action) => {

        await PostLikesRepository.update(
          {
              postId: In(postsId),
          },
          action,
        );

        // await PostLikesRepository
        //   .createQueryBuilder('eli')
        //   .update()
        //   .set(action)
        //   .where({ postId: In(postsId) })
    },

    changeCommentsReactions: async (CommentLikesRepository, commentsId, action) => {

        await CommentLikesRepository
          .update({  commentId: In(commentsId) }, action);

        // await CommentLikesRepository
        //   .createQueryBuilder('eli')
        //   .leftJoinAndSelect('eli.comment', 'c')
        //   .update()
        //   .set(action)
        //   .where({ commentId: In(commentsId) })
    }
}
