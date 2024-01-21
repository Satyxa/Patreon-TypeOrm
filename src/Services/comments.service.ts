import {InjectDataSource, InjectRepository} from "@nestjs/typeorm";
import {DataSource, Repository} from "typeorm";
import {getResultByToken, getUserId} from "../Utils/authentication";
import {HttpException, UnauthorizedException} from "@nestjs/common";
import {commentsReactionsT, commentsSQL, commentsT, SessionsType} from "../Types/types";
import {CheckEntityId} from "../Utils/checkEntityId";
import {ReactionsUtils} from "../Utils/ReactionsUtils";
import {EntityWithReactions} from "../Utils/EntityWithReactions";
import {EntityUtils} from "../Utils/EntityUtils";
import {CommentReactions} from "../Entities/Comment/CommentReactionsEntity";
import {Comment} from "../Entities/Comment/CommentEntity";
import {LikesInfo} from "../Entities/Comment/LikesInfoEntity";

export class CommentsService {
    constructor(@InjectRepository(Comment)
                protected CommentRepository: Repository<Comment>,
                @InjectRepository(CommentReactions)
                protected CommentReactionsRepository: Repository<CommentReactions>,
                @InjectRepository(LikesInfo)
                protected LikesInfoRepository: Repository<LikesInfo>) {}

    async deleteAll(){
        return await this.CommentRepository
            .update({}, {deleted: true})
    }

    async getComment(id, headers) {
        const comment = await CheckEntityId
            .checkCommentId(this.CommentRepository, id)
        let userId = await getUserId(headers)
        const reactions: commentsReactionsT[] = await EntityWithReactions
            .getCommentsInfo(this.CommentReactionsRepository)

        return EntityUtils.createViewComment(comment, userId, reactions)
    }

    async deleteComment(id, userId) {
        const comment = await CheckEntityId
            .checkCommentId(this.CommentRepository, id)
        if (userId !== comment.CommentatorInfo.userId) throw new HttpException('FORBIDDEN', 403)

        await this.CommentRepository
            .update({id}, {deleted: true})
    }

    async updateCommentContent(id, userId, content){
        const comment: commentsSQL = await CheckEntityId.checkCommentId(this.CommentRepository, id)
        if (userId !== comment.CommentatorInfo.userId) throw new HttpException('FORBIDDEN', 403)

        await this.CommentRepository
            .update({id}, {content})
    }

    async updateCommentLikeStatus(commentId, likeStatus, userId) {
        await CheckEntityId.checkCommentId(this.CommentRepository, commentId)

        const previousStatus = await ReactionsUtils
            .findReaction(this.CommentReactionsRepository,
                commentId, userId)

        if(previousStatus === likeStatus) return
        else if(!previousStatus && likeStatus === 'None') return

        if(!previousStatus && likeStatus !== 'None'){
            const likesCount = likeStatus === 'Like' ? 1 : 0
            const dislikesCount = likeStatus === "Dislike" ? 1 : 0

            await ReactionsUtils.addReaction(this.CommentReactionsRepository,
                userId, commentId, likeStatus)

            await this.LikesInfoRepository
                .update(commentId,
            {likesCount: () => `likesCount + ${likesCount}` ,
                        dislikesCount: () => `dislikesCount + ${dislikesCount}`});
        }

            if(previousStatus === 'Like' && likeStatus === 'Dislike'){
                await this.LikesInfoRepository
                    .update(commentId,
                    {likesCount: () => `likesCount - 1` ,
                                dislikesCount: () => `dislikesCount + 1`});
                await ReactionsUtils
                    .updateReactions(this.CommentReactionsRepository,
                        commentId, userId, likeStatus)
            }

            if(previousStatus === 'Like' && likeStatus === 'None'){
                await this.LikesInfoRepository
                    .update(commentId,
                    {likesCount: () => `likesCount - 1`});
                await ReactionsUtils
                    .deleteReaction(this.CommentReactionsRepository,
                        commentId, userId)
            }

            if(previousStatus === 'Dislike' && likeStatus === 'Like'){
                await this.LikesInfoRepository
                    .update(commentId,
                        {likesCount: () => `likesCount + 1` ,
                                    dislikesCount: () => `dislikesCount - 1`});
                await ReactionsUtils
                    .updateReactions(this.CommentReactionsRepository,
                        commentId, userId, likeStatus)
            }

            if(previousStatus === 'Dislike' && likeStatus === 'None') {
                await this.LikesInfoRepository
                    .update(commentId,
                        {dislikesCount: () => `dislikesCount - 1`});
                await ReactionsUtils
                    .deleteReaction(this.CommentReactionsRepository,
                        commentId, userId)
            }
        }
}