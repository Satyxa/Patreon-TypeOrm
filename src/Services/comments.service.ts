import {HttpException, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Comment, CommentDocument} from "../Mongoose/CommentSchema";
import {commentsT} from "../Types/types";
import {getResultByToken} from "../Utils/authentication";
import {EntityUtils} from "../Utils/EntityUtils";

@Injectable()
export class CommentsService {
    constructor(@InjectModel(Comment.name) private CommentModel: Model<CommentDocument>){}
    async getComment(id, headers) {
        const comment: commentsT | null = await this.CommentModel.findOne({id}, {projection: {_id: 0, postId: 0, reactions: 0}}).lean()
        if(!comment) throw new HttpException('Not Found', 404)
        let userId:string = '';
        if(headers.authorization){
            const accessToken = headers.authorization.split(' ')[1]
            const result = getResultByToken(accessToken)
            if(result) userId = result.userId
        }
        const isReactionsFromUser = comment.reactions.filter(el => el.userId === userId)

        let updatedComment;
        const projection = {reactions: 0, _id: 0, __v: 0, postId: 0, 'likesInfo._id': 0, 'commentatorInfo._id': 0}

        if(isReactionsFromUser.length) updatedComment = await this.CommentModel.findOneAndUpdate({id},
                {'likesInfo.myStatus': isReactionsFromUser[0].status},
                {new: true, projection})

        else updatedComment = await this.CommentModel.findOneAndUpdate({id},
                {'likesInfo.myStatus': 'None'},
                {new: true, projection})

        return updatedComment

    }
    async deleteComment(id, userId) {
        const comment: commentsT | null = await this.CommentModel.findOne({id})
        if (!comment) throw new HttpException('Not Found', 404)
        if (userId !== comment.commentatorInfo.userId) throw new HttpException('FORBIDDEN', 403)
        await this.CommentModel.deleteOne({id})
    }

    async updateContent(id, userId, content){
        const comment: commentsT| null = await this.CommentModel.findOne({id})
        if (!comment) throw new HttpException('Not Found', 404)
        if (userId !== comment.commentatorInfo.userId) throw new HttpException('FORBIDDEN', 403)
        await this.CommentModel.updateOne({id}, {$set: {content}})
    }


    async updateLikeStatus(commentId, likeStatus, userId) {
        const comment = await this.CommentModel.findOne({id: commentId}).lean()
        if(!comment) throw new HttpException('Not Found', 404)
        const reaction = EntityUtils.createReaction(userId, likeStatus)
        const commentCopy: commentsT = {...comment}
        const userLikeStatus = commentCopy.reactions.filter(reaction => reaction.userId === userId)[0]

        if(!userLikeStatus && likeStatus !== 'None'){
            const likesCount = likeStatus === 'Like' ? 1 : 0
            const dislikesCount = likeStatus === "Dislike" ? 1 : 0
            await this.CommentModel.updateOne({id: commentId},
                {$push: {reactions: reaction}, $inc:  {'likesInfo.likesCount': likesCount, 'likesInfo.dislikesCount': dislikesCount},})
        }

        if (userLikeStatus && userLikeStatus.status !== likeStatus){
            if(userLikeStatus.status === 'Like' && likeStatus === 'Dislike'){
                 await this.CommentModel.updateOne({id: commentId, reactions: {$elemMatch: {'userId': userLikeStatus.userId}}},
                    {$set: {reactions:reaction}, $inc: {'likesInfo.likesCount': -1, 'likesInfo.dislikesCount': 1},}, {returnDocument: "after"})}

            if(userLikeStatus.status === 'Like' && likeStatus === 'None'){
                await this.CommentModel.updateOne({id: commentId},
                    {$pull: {reactions: {userId}}, $inc: {'likesInfo.likesCount': -1},})}

            if(userLikeStatus.status === 'Dislike' && likeStatus ==='Like'){
                await this.CommentModel.updateOne({id: commentId, reactions: {$elemMatch: {'userId': userLikeStatus.userId}}},
                    {$set: {reactions: reaction}, $inc: {'likesInfo.dislikesCount': -1, 'likesInfo.likesCount': 1},})}

            if(userLikeStatus.status === 'Dislike' && likeStatus === 'None'){
                await this.CommentModel.updateOne({id: commentId},
                    {$pull: {reactions: {userId}}, $inc: {'likesInfo.dislikesCount': -1}})}
        }
    }
}
