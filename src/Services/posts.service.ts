
import {commentsPS, postsPS} from "../Utils/PaginationAndSort";
import {EntityUtils} from "../Utils/EntityUtils";
import {BadRequestException, HttpException, Injectable, UnauthorizedException} from "@nestjs/common";
import {blogsT, newestLikesT, postT, reactionsT, UserAccountDBType} from "../Types/types";
import {getResultByToken, getUserId} from "../Utils/authentication";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {EntityWithReactions} from "../Utils/EntityWithReactions";
import {CheckEntityId} from "../Utils/checkEntityId";

@Injectable()
export class PostService {
    constructor(@InjectDataSource() protected dataSource: DataSource) {}

    deleteAllPosts(): any {
        return this.dataSource.query(`DELETE FROM "Posts"`)
    }

    async getAllPosts(payload, headers): Promise<any> {
        const {posts, pagesCount, pageNumber, pageSize, totalCount} = await postsPS(this.dataSource, payload)
        const {reactions, newestLikes} = await EntityWithReactions.getPostsInfo(this.dataSource)

        const userId = getUserId(headers)

        const viewPosts = posts.map(post =>
            EntityUtils.GetPost(post, userId, reactions, newestLikes))
        return ({
            pagesCount, page: pageNumber, pageSize,
            totalCount, items: viewPosts
        })
    }

    async getOnePost(id, headers) {
        const {reactions, newestLikes} = await EntityWithReactions.getPostsInfo(this.dataSource)

        const userId = getUserId(headers)
        const post = await CheckEntityId.checkPostId(this.dataSource, id)

        return EntityUtils.GetPost(post, userId, reactions, newestLikes)
    }

    async createPost(payload) {
        const {title, shortDescription, content, blogId} = payload
        const blog = await CheckEntityId.checkBlogId(this.dataSource, blogId, 'for post')

        return await EntityUtils.CreatePost(title, shortDescription, content,
            blogId, blog.name, this.dataSource)
    }

    async deletePost(id, blogId: string | null = null) {
        await CheckEntityId.checkPostId(this.dataSource, id)
        if (blogId) await CheckEntityId.checkBlogId(this.dataSource, blogId, 'for blog')
        await this.dataSource.query(`
        DELETE FROM "Posts" where id = $1
        `, [id])
    }

    async updatePost(postId, payload) {
        const {title, shortDescription, content, blogId} = payload

        const blog = await CheckEntityId.checkBlogId(this.dataSource, blogId, 'for post')
        await CheckEntityId.checkPostId(this.dataSource, postId)

        await this.dataSource.query(
        `UPDATE "Posts" SET title = $1, "shortDescription" = $2,
        content = $3, "blogId" = $4, "blogName" = $5
        where id = $6`,
        [title, shortDescription, content, blogId,  blog.name, postId])
    }

    // async getCommentsForOnePost(id, payload, headers) {
    //     if (!await this.PostModel.findOne({id})) throw new HttpException('Not Found', 404)
    //
    //     const {
    //         comments,
    //         pagesCount,
    //         pageNumber,
    //         pageSize,
    //         totalCount
    //     } = await commentsPS(this.CommentModel, payload, {postId: id})
    //     let userId: string = '';
    //     if (headers.authorization) {
    //         const accessToken = headers.authorization.split(' ')[1]
    //         const result = getResultByToken(accessToken)
    //         if (result) userId = result.userId
    //     }
    //
    //     const viewComments = comments.map(comment => (EntityUtils.createViewComment(comment, userId)))
    //
    //     return ({pagesCount, page: +pageNumber, pageSize, totalCount, items: viewComments})
    // }

    // async createCommentForPost(id, content, userId) {
    //     console.log(userId)
    //     if (!await this.PostModel.findOne({id})) throw new HttpException('Not Found', 404)
    //     const user: UserAccountDBType | null = await this.UserModel.findOne({id: userId})
    //     if (!user) throw new HttpException('Not Found', 404)
    //
    //     const {comment, viewComment} = EntityWithReactions.createComment(id, content, user)
    //
    //     await this.CommentModel.create({...comment})
    //     await this.PostModel.updateOne({id}, {$push: {comments: comment}})
    //     return viewComment
    //
    // }


    // async updatePostLikeStatus(id, likeStatus, userId) {
    //     const post: postT | null = await this.PostModel.findOne({id}).lean()
    //     if (!post) throw new HttpException('Not Found', 404)
    //
    //     const userLikeStatus = post.reactions.filter(reaction => reaction.userId === userId)[0]
    //     const reaction: reactionsT = EntityUtils.createReaction(userId, likeStatus)
    //     if (!userLikeStatus && likeStatus === 'None') return
    //     if (userLikeStatus && userLikeStatus.status === likeStatus) return
    //
    //     const user: UserAccountDBType | null = await this.UserModel.findOne({id: userId}).lean()
    //     if (!user) throw new UnauthorizedException()
    //     const login = user.AccountData.username
    //     const newestLike: newestLikesT = EntityUtils.createNewestLike(userId, login)
    //
    //     const updateNewestLikes = {$each: [newestLike], $position: 0}
    //     const setReaction = {reactions: reaction}
    //
    //     if (!userLikeStatus) {
    //         if (likeStatus === 'Like') {
    //             await this.PostModel.updateOne({id}, {
    //                 $push: {reactions: reaction, 'extendedLikesInfo.newestLikes': updateNewestLikes},
    //                 $inc: {'extendedLikesInfo.likesCount': 1}
    //             })
    //         } else {
    //             await this.PostModel.updateOne({id}, {
    //                 $push: {reactions: reaction},
    //                 $inc: {'extendedLikesInfo.dislikesCount': 1}
    //             })
    //         }
    //     }
    //
    //     if (userLikeStatus) {
    //         const findByUserId = {userId: userLikeStatus.userId}
    //         const filterForUpdate = {id, reactions: {$elemMatch: findByUserId}}
    //         if (userLikeStatus.status === 'Like') {
    //             if (likeStatus === 'Dislike') {
    //                 await this.PostModel.updateOne(filterForUpdate,
    //                     {
    //                         $set: {reactions: reaction},
    //                         $pull: {'extendedLikesInfo.newestLikes': findByUserId},
    //                         $inc: {
    //                             'extendedLikesInfo.likesCount': -1,
    //                             'extendedLikesInfo.dislikesCount': 1
    //                         }
    //                     })
    //             } else {
    //                 await this.PostModel.updateOne(filterForUpdate,
    //                     {
    //                         $pull: {reactions: findByUserId, 'extendedLikesInfo.newestLikes': findByUserId},
    //                         $inc: {'extendedLikesInfo.likesCount': -1}
    //                     })
    //             }
    //         }
    //
    //         if (userLikeStatus.status === 'Dislike') {
    //             if (likeStatus === 'Like') {
    //                 await this.PostModel.updateOne(filterForUpdate,
    //                     {
    //                         $push: {'extendedLikesInfo.newestLikes': updateNewestLikes},
    //                         $set: {reactions: reaction},
    //                         $inc: {
    //                             'extendedLikesInfo.likesCount': 1,
    //                             'extendedLikesInfo.dislikesCount': -1
    //                         }
    //                     })
    //             } else {
    //                 await this.PostModel.updateOne(filterForUpdate,
    //                     {
    //                         $pull: {reactions: findByUserId},
    //                         $inc: {'extendedLikesInfo.dislikesCount': -1}
    //                     })
    //             }
    //         }
    //     }
    // }
}