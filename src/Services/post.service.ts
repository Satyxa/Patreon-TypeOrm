import {InjectModel} from "@nestjs/mongoose";
import {Post, PostDocument} from "../Mongoose/PostSchema";
import {Model} from "mongoose";
import {commentsPS, postsPS} from "../Utils/PaginationAndSort";
import {EntityUtils} from "../Utils/EntityUtils";
import {BadRequestException, HttpException, Injectable, UnauthorizedException} from "@nestjs/common";
import {blogsT, newestLikesT, postT, reactionsT, UserAccountDBType} from "../Types/types";
import {Blog, BlogDocument} from "../Mongoose/BlogSchema";
import {getResultByToken} from "../Utils/authentication";
import {Comment, CommentDocument} from "../Mongoose/CommentSchema";
import {EntityWithReactions} from "../Utils/EntityWithReactions";
import {User, UserDocument} from "../Mongoose/UserSchema";

@Injectable()
export class PostService {
    constructor(@InjectModel(Post.name) private PostModel: Model<PostDocument>,
                @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
                @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
                @InjectModel(User.name) private UserModel: Model<UserDocument>,) {
    }

    deleteAllPosts(): any {
        return this.PostModel.deleteMany({})
    }

    async getAllPosts(payload, headers): Promise<any> {
        const {posts, pagesCount, pageNumber, pageSize, totalCount} = await postsPS(this.PostModel, payload, {})
        let userId = ''
        if(headers.authorization){
            const accessToken = headers.authorization.split(' ')[1]
            const result = getResultByToken(accessToken)
            if(result) userId = result.userId
        }
        const viewPosts = posts.map(post => {
            return EntityUtils.GetPost(post, userId)
        })
        return ({
            pagesCount, page: pageNumber, pageSize,
            totalCount, items: viewPosts
        })
    }

    async getOnePost(id, headers): Promise<PostDocument | null> {
        let userId = ''
        if(headers.authorization){
            const accessToken = headers.authorization.split(' ')[1]
            const result = getResultByToken(accessToken)
            if(result) userId = result.userId
        }
        const post = await this.PostModel.findOne({id}, {projection: {_id: 0, comments: 0}}).lean()
        if (!post) throw new HttpException('Not Found', 404)
        return EntityUtils.GetPost(post, userId)
    }

    async createPost(payload) {
        const {title, shortDescription, content, blogId} = payload
        const blog: blogsT | null = await this.BlogModel.findOne({id: blogId})
        if (!blog) throw new HttpException('Not Found', 404)

        const newPost: postT = EntityUtils.CreatePost(title, shortDescription, content, blogId, blog.name)

        const createdPost = new this.PostModel(newPost)
        await createdPost.save()

        const {comments, reactions, ...post} = newPost

        return post
    }

    async deletePost(id) {
        const post = await this.PostModel.findOne({id})
        if (!post) throw new HttpException('Not Found', 404)
        await this.PostModel.deleteOne({id})
    }

    async updatePost(id, payload) {
        const {title, shortDescription, content, blogId} = payload
        const post = await this.PostModel.findOne({id})
        const blog: blogsT | null = await this.BlogModel.findOne({id: blogId})
        if (!post) throw new HttpException('Not Found', 404)
        if(!blog) throw new BadRequestException([{ field: 'blogId', message: 'Such blog doesnt exist'}])
        await this.PostModel.updateOne({id},
            {
                $set: {
                    title,
                    shortDescription,
                    content,
                    blogId,
                    blogName: blog!.name,
                }
            })
    }

    async getCommentsForOnePost(id, payload, headers) {
        if (!await this.PostModel.findOne({id})) throw new HttpException('Not Found', 404)

        const {
            comments,
            pagesCount,
            pageNumber,
            pageSize,
            totalCount
        } = await commentsPS(this.CommentModel, payload, {postId: id})
        let userId: string = '';
        if (headers.authorization) {
            const accessToken = headers.authorization.split(' ')[1]
            const result = getResultByToken(accessToken)
            if (result) userId = result.userId
        }
        const viewComments = comments.map(comment => (EntityUtils.createViewComment(comment, userId)))

        return ({pagesCount, page: +pageNumber, pageSize, totalCount, items: viewComments})
    }

    async createCommentForPost(id, content, userId) {
        console.log(userId)
        if (!await this.PostModel.findOne({id})) throw new HttpException('Not Found', 404)
        const user: UserAccountDBType | null = await this.UserModel.findOne({id: userId})
        if (!user) throw new HttpException('Not Found', 404)

        const {comment, viewComment} = EntityWithReactions.createComment(id, content, user)

        await this.CommentModel.create({...comment})
        await this.PostModel.updateOne({id}, {$push: {comments: comment}})
        return viewComment

    }


    async updatePostLikeStatus(id, likeStatus, userId) {
        const post: postT | null = await this.PostModel.findOne({id}).lean()
        if (!post) throw new HttpException('Not Found', 404)

        const userLikeStatus = post.reactions.filter(reaction => reaction.userId === userId)[0]
        const reaction: reactionsT = EntityUtils.createReaction(userId, likeStatus)
        if (!userLikeStatus && likeStatus === 'None') return
        if (userLikeStatus && userLikeStatus.status === likeStatus) return

        const user: UserAccountDBType | null = await this.UserModel.findOne({id: userId}).lean()
        if (!user) throw new UnauthorizedException()
        const login = user.AccountData.username
        const newestLike: newestLikesT = EntityUtils.createNewestLike(userId, login)

        const updateNewestLikes = {$each: [newestLike], $position: 0}
        const setReaction = {reactions: reaction}

        if (!userLikeStatus) {
            if (likeStatus === 'Like') {
                await this.PostModel.updateOne({id}, {
                    $push: {reactions: reaction, 'extendedLikesInfo.newestLikes': updateNewestLikes},
                    $inc: {'extendedLikesInfo.likesCount': 1}
                })
            } else {
                await this.PostModel.updateOne({id}, {
                    $push: {reactions: reaction},
                    $inc: {'extendedLikesInfo.dislikesCount': 1}
                })
            }
        }

        if (userLikeStatus) {
            const findByUserId = {userId: userLikeStatus.userId}
            const filterForUpdate = {id, reactions: {$elemMatch: findByUserId}}
            if (userLikeStatus.status === 'Like') {
                if (likeStatus === 'Dislike') {
                    await this.PostModel.updateOne(filterForUpdate,
                        {
                            $set: {reactions: reaction},
                            $pull: {'extendedLikesInfo.newestLikes': findByUserId},
                            $inc: {
                                'extendedLikesInfo.likesCount': -1,
                                'extendedLikesInfo.dislikesCount': 1
                            }
                        })
                } else {
                    await this.PostModel.updateOne(filterForUpdate,
                        {
                            $pull: {reactions: findByUserId, 'extendedLikesInfo.newestLikes': findByUserId},
                            $inc: {'extendedLikesInfo.likesCount': -1}
                        })
                }
            }

            if (userLikeStatus.status === 'Dislike') {
                if (likeStatus === 'Like') {
                    await this.PostModel.updateOne(filterForUpdate,
                        {
                            $push: {'extendedLikesInfo.newestLikes': updateNewestLikes},
                            $set: {reactions: reaction},
                            $inc: {
                                'extendedLikesInfo.likesCount': 1,
                                'extendedLikesInfo.dislikesCount': -1
                            }
                        })
                } else {
                    await this.PostModel.updateOne(filterForUpdate,
                        {
                            $pull: {reactions: findByUserId},
                            $inc: {'extendedLikesInfo.dislikesCount': -1}
                        })
                }
            }
        }
    }
}