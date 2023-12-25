import {commentsPS, postsPS} from "../Utils/PaginationAndSort";
import {EntityUtils} from "../Utils/EntityUtils";
import {BadRequestException, HttpException, Injectable, UnauthorizedException} from "@nestjs/common";
import * as uuid from 'uuid'
import {getResultByToken, getUserId} from "../Utils/authentication";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {EntityWithReactions} from "../Utils/EntityWithReactions";
import {CheckEntityId} from "../Utils/checkEntityId";
import {NewestLikesUtils, ReactionsUtils} from "../Utils/ReactionsUtils";
import {commentsReactionsT} from "../Types/types";

@Injectable()
export class PostService {
    constructor(@InjectDataSource() protected dataSource: DataSource) {}

    async deleteAllPosts() {
        await this.dataSource.query(`
        DELETE FROM "Reactions"
        `)
        await this.dataSource.query(`
        DELETE FROM "NewestLikes"
        `)
        await this.dataSource.query(`
        DELETE FROM "CommentsReactions"
        `)
        return this.dataSource.query(`DELETE FROM "Posts"`)
    }

    async getAllPosts(payload, headers): Promise<any> {
        const {posts, pagesCount, pageNumber, pageSize, totalCount} = await postsPS(this.dataSource, payload)
        const {reactions, newestLikes} = await EntityWithReactions.getPostsInfo(this.dataSource)

        const userId = await getUserId(headers)

        const viewPosts = posts.map(post =>
            EntityUtils.GetPost(post, userId, reactions, newestLikes))
        return ({
            pagesCount, page: pageNumber, pageSize,
            totalCount, items: viewPosts
        })
    }

    async getOnePost(id, headers) {
        const {reactions, newestLikes} = await EntityWithReactions.getPostsInfo(this.dataSource)

        const userId = await getUserId(headers)
        const post = await CheckEntityId.checkPostId(this.dataSource, id)

        return EntityUtils.GetPost(post, userId, reactions, newestLikes)
    }

    async createPost(payload, message = 'for post') {
        const {title, shortDescription, content, blogId} = payload
        const blog = await CheckEntityId.checkBlogId(this.dataSource, blogId, message)

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

    async updatePost(postId, payload, message = 'for post') {
        const {title, shortDescription, content, blogId} = payload

        const blog = await CheckEntityId.checkBlogId(this.dataSource, blogId, message)
        await CheckEntityId.checkPostId(this.dataSource, postId)

        await this.dataSource.query(
            `UPDATE "Posts" SET title = $1, "shortDescription" = $2,
        content = $3, "blogId" = $4, "blogName" = $5
        where id = $6`,
            [title, shortDescription, content, blogId, blog.name, postId])
    }

    async getCommentsForOnePost(id, payload, headers) {
        await CheckEntityId.checkPostId(this.dataSource, id)
        const reactions: commentsReactionsT[] = await EntityWithReactions.getCommentsInfo(this.dataSource)

        const {comments, pagesCount,
            pageNumber, pageSize, totalCount} = await commentsPS(this.dataSource, payload, id)
        let userId = await getUserId(headers)

        const viewComments = comments.map(comment => EntityUtils.createViewComment(comment, userId, reactions))

        return ({pagesCount, page: +pageNumber, pageSize, totalCount, items: viewComments})
    }

    async createCommentForPost(id, content, userId) {
        await CheckEntityId.checkPostId(this.dataSource, id)
        const user = await CheckEntityId.checkUserId(this.dataSource, userId)
        const commentId = uuid.v4()
        const createdAt = new Date().toISOString()

        await this.dataSource.query(`
        INSERT INTO "Comments" ("content", "postId", "userId",
        "id", "createdAt", "userLogin", "dislikesCount",
        "likesCount", "myStatus")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [content, id, userId, commentId,
            createdAt, user.username, 0, 0, 'None'])

        return EntityWithReactions.createComment(id, content, user, commentId, createdAt)
    }


    async updatePostLikeStatus(postId, likeStatus, userId) {
        await CheckEntityId.checkPostId(this.dataSource, postId)
        const user = await CheckEntityId.checkUserId(this.dataSource, userId)

        const UserReaction = await this.dataSource.query(`
        SELECT * FROM "Reactions"
        where "postId" = $1 and "userId" = $2
        `, [postId, userId])

        const previousStatus = UserReaction.length ? UserReaction[0].status : 'None'
        console.log(previousStatus, 'PREVIOUS STATUS')
        console.log(UserReaction)
        if (!UserReaction.length && likeStatus === 'None') return
        if (previousStatus === likeStatus) return
        if (!UserReaction.length) {
            await ReactionsUtils
                .addReaction(this.dataSource, userId, postId, likeStatus)

            if (likeStatus === 'Like') {
                console.log('NO REACTION CAME LIKE')
                await NewestLikesUtils
                    .addNewLike(this.dataSource, postId, userId, user.username)

                await this.dataSource.query(`
                UPDATE "Posts" SET "likesCount" = "likesCount" + 1
                where "id" = $1`, [postId])
            } else {
                console.log('NO REACTION CAME DISLIKE')
                await this.dataSource.query(`
                UPDATE "Posts" SET "dislikesCount" = "dislikesCount" + 1
                where "id" = $1`, [postId])
            }
        }

        if (previousStatus === 'Like') {
            await NewestLikesUtils.deleteNewLike(this.dataSource, postId, userId)

            if (likeStatus === 'Dislike') {
                console.log('WAS LIKE CAME DISLIKE')
                await ReactionsUtils.updateReactions(this.dataSource, postId, userId, 'Dislike')
                await this.dataSource.query(`
                    UPDATE "Posts" SET "likesCount" = "likesCount" - 1,
                    "dislikesCount" = "dislikesCount" + 1
                    where "id" = $1`, [postId])

            } else {
                console.log('WAS LIKE CAME NONE')
                await ReactionsUtils.deleteReaction(this.dataSource, postId, userId)
                await this.dataSource.query(`
                    UPDATE "Posts" SET "likesCount" = "likesCount" - 1
                    where "id" = $1`, [postId])
            }
        }

        if (previousStatus === 'Dislike') {
            if (likeStatus === 'Like') {
                console.log('WAS DISLIKE CAME LIKE')
                await ReactionsUtils.updateReactions(this.dataSource, postId, userId, likeStatus)
                await NewestLikesUtils.addNewLike(this.dataSource, postId, userId, user.username)

                await this.dataSource.query(`
                UPDATE "Posts" SET "likesCount" = "likesCount" + 1,
                "dislikesCount" = "dislikesCount" - 1
                where id = $1`, [postId])

            } else {
                console.log('WAS DISLIKE CAME NONE')
                await ReactionsUtils.deleteReaction(this.dataSource, postId, userId)
                await this.dataSource.query(`
                UPDATE "Posts" 
                SET "dislikesCount" = "dislikesCount" - 1
                where id = $1`, [postId])
            }
        }
    }
}