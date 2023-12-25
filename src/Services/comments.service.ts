import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {getResultByToken, getUserId} from "../Utils/authentication";
import {HttpException, UnauthorizedException} from "@nestjs/common";
import {commentsReactionsT, commentsSQL, commentsT, SessionsType} from "../Types/types";
import {CheckEntityId} from "../Utils/checkEntityId";
import {ReactionsUtils} from "../Utils/ReactionsUtils";
import {EntityWithReactions} from "../Utils/EntityWithReactions";
import {EntityUtils} from "../Utils/EntityUtils";

export class CommentsService {
    constructor(@InjectDataSource() protected dataSource: DataSource) {}

    async deleteAll(){
        return await this.dataSource.query(`
        DELETE FROM "Comments"`)
    }

    async getComment(id, headers) {
        const comment = await CheckEntityId.checkCommentId(this.dataSource, id)
        let userId = await getUserId(headers)
        const reactions: commentsReactionsT[] = await EntityWithReactions.getCommentsInfo(this.dataSource)

        return EntityUtils.createViewComment(comment, userId, reactions)
    }

    async deleteComment(id, userId) {
        const comment: commentsSQL = await CheckEntityId.checkCommentId(this.dataSource, id)
        if (userId !== comment.userId) throw new HttpException('FORBIDDEN', 403)

        await this.dataSource.query(`
        DELETE FROM "Comments" where id = $1
        `, [id])
    }

    async updateCommentContent(id, userId, content){
        const comment: commentsSQL = await CheckEntityId.checkCommentId(this.dataSource, id)
        if (userId !== comment.userId) throw new HttpException('FORBIDDEN', 403)

        await this.dataSource.query(`
        UPDATE "Comments" SET "content" = $1
        where id = $2`, [content, id])
    }

    async updateCommentLikeStatus(commentId, likeStatus, userId) {
        await CheckEntityId.checkCommentId(this.dataSource, commentId)
        const previousStatus = await ReactionsUtils.findReaction(this.dataSource, commentId, userId, 'comment')
        const createdAt = new Date().toISOString()

        if(previousStatus && previousStatus === likeStatus) return
        else if(!previousStatus && likeStatus === 'None') return

        if(!previousStatus && likeStatus !== 'None'){
            const likesCount = likeStatus === 'Like' ? 1 : 0
            const dislikesCount = likeStatus === "Dislike" ? 1 : 0

            await this.dataSource.query(`
            INSERT INTO "CommentsReactions"
            ("commentId", "userId", "status", "createdAt")
            VALUES ($1, $2, $3, $4)`,
            [commentId, userId, likeStatus, createdAt])

            await this.dataSource
            .query(`UPDATE "Comments" 
            SET "likesCount" = "likesCount" + $1,
            "dislikesCount" = "dislikesCount" + $2
            where id = $3
            `, [likesCount, dislikesCount, commentId])
        }

            if(previousStatus === 'Like' && likeStatus === 'Dislike'){
                await this.dataSource.query(`
                UPDATE "Comments" SET "likesCount" = "likesCount" - 1,
                "dislikesCount" = "dislikesCount" + 1
                where id = $1
                `, [commentId])

                await ReactionsUtils.updateReactions(this.dataSource, commentId, userId, likeStatus, 'comment')
            }

            if(previousStatus === 'Like' && likeStatus === 'None'){
                await this.dataSource.query(`
                UPDATE "Comments" 
                SET "likesCount" = "likesCount" - 1
                where id = $1`, [commentId])

                await ReactionsUtils.deleteReaction(this.dataSource, commentId, userId, 'comment')
            }

            if(previousStatus === 'Dislike' && likeStatus === 'Like'){

                await this.dataSource.query(`
                UPDATE "Comments" 
                SET "dislikesCount" = "dislikesCount" - 1,
                "likesCount" = "likesCount" + 1
                where id = $1`, [commentId])

                await ReactionsUtils
                    .updateReactions(this.dataSource, commentId, userId, likeStatus, 'comment')
            }

            if(previousStatus === 'Dislike' && likeStatus === 'None') {
                await this.dataSource.query(`
                UPDATE "Comments" 
                SET "dislikesCount" = "dislikesCount" - 1
                where id = $1`, [commentId])

                await ReactionsUtils
                    .deleteReaction(this.dataSource, commentId, userId, 'comment')
            }
        }
}