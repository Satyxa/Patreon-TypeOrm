import {commentsPS, postsPS} from "../../Utils/PaginationAndSort";
import {EntityUtils} from "../../Utils/Entity.utils";
import {HttpException, Injectable} from "@nestjs/common";
import * as uuid from 'uuid'
import {getUserId} from "../../Utils/authentication";
import {InjectRepository} from "@nestjs/typeorm";
import {Brackets, Repository} from "typeorm";
import {EntityWithReactions} from "../../Utils/EntityWithReactions";
import {CheckEntityId} from "../../Utils/checkEntityId";
import {Post} from "../../Entities/Posts/Post.entity";
import {Blog} from "../../Entities/Blog/Blog.entity";
import {ExtendedLikesInfo} from "../../Entities/Posts/ExtendedLikesInfo.entity";
import {NewestLikes} from "../../Entities/Posts/NewestLikes.entity";
import {Comment} from "../../Entities/Comment/Comment.entity";
import {CommentReactions} from "../../Entities/Comment/CommentReactions.entity";
import {LikesInfo} from "../../Entities/Comment/LikesInfo.entity";
import {CommentatorInfo} from "../../Entities/Comment/CommentatorInfo.entity";
import {User} from "../../Entities/User/User.entity";
import {NewestLikesUtils, ReactionsUtils} from "../../Utils/Reactions.utils";
import {PostReactions} from "../../Entities/Posts/PostReactions.entity";
import { BlogBannedUsers } from '../../Entities/Blog/BlogBannedUsers.entity';

@Injectable()
export class PostService {
    constructor(@InjectRepository(Post)
                protected PostRepository: Repository<Post>,
                @InjectRepository(Blog)
                protected BlogRepository: Repository<Blog>,
                @InjectRepository(ExtendedLikesInfo)
                protected ExtendedLikesInfoRepository: Repository<ExtendedLikesInfo>,
                @InjectRepository(NewestLikes)
                protected NewestLikesRepository: Repository<NewestLikes>,
                @InjectRepository(Comment)
                protected CommentRepository: Repository<Comment>,
                @InjectRepository(CommentReactions)
                protected CommentReactionsRepository: Repository<CommentReactions>,
                @InjectRepository(CommentatorInfo)
                protected CommentatorInfoRepository: Repository<CommentatorInfo>,
                @InjectRepository(User)
                protected UserRepository: Repository<User>,
                @InjectRepository(LikesInfo)
                protected LikesInfoRepository: Repository<LikesInfo>,
                @InjectRepository(PostReactions)
                protected PostReactionsRepository: Repository<PostReactions>,
                @InjectRepository(BlogBannedUsers)
                protected BlogBannedUsersRepository: Repository<BlogBannedUsers>,) {}

    async deleteAllPosts() {
        return this.PostRepository
            .delete({})
    }

    async getAllPosts(payload, headers): Promise<any> {
        const {posts, pagesCount, pageNumber, pageSize, totalCount} = await postsPS(this.PostRepository, payload)
        const {reactions, newestLikes, extendedLikesInfo} =
            await EntityWithReactions
                .getPostsInfo(
                    this.NewestLikesRepository,
                    this.ExtendedLikesInfoRepository,
                    this.PostReactionsRepository)

        const userId = await getUserId(headers)

        const viewPosts = posts.map(post =>
            EntityUtils.GetPost(post, newestLikes, reactions, extendedLikesInfo, userId))
        return ({
            pagesCount, page: pageNumber, pageSize,
            totalCount, items: viewPosts
        })
    }

    async getOnePost(id, headers) {
        const {reactions, newestLikes, extendedLikesInfo} =
            await EntityWithReactions
                .getPostsInfo(
                    this.NewestLikesRepository,
                    this.ExtendedLikesInfoRepository,
                    this.PostReactionsRepository)

        const userId = await getUserId(headers)
        const post = await CheckEntityId.checkPostId(this.PostRepository, id)

        return EntityUtils.GetPost(post, newestLikes, reactions, extendedLikesInfo, userId)
    }

    async createPost(payload, message = 'for post', userId: null | string = null) {
        const {title, shortDescription, content, blogId} = payload
        const blog = await CheckEntityId.checkBlogId(this.BlogRepository, blogId, message)

        if(userId && blog.AccountData.userId !== userId)
            throw new HttpException('Forbidden', 403)

        return await EntityUtils
            .CreatePost(this.PostRepository, this.ExtendedLikesInfoRepository,
                title, shortDescription, content, blog, blog.name)
    }

    async deletePost(id, blogId: string | null = null, userId: null | string = null) {
        await CheckEntityId.checkPostId(this.PostRepository, id)
        if (blogId) {
            const blog = await CheckEntityId
              .checkBlogId(this.BlogRepository, blogId, 'for blog');

            if(userId && blog.AccountData.userId !== userId)
                throw new HttpException('Forbidden', 403)
        }
        await this.PostRepository.delete({id})
    }

    async updatePost(postId, payload, message = 'for post', userId: null | string = null) {
        const {title, shortDescription, content, blogId} = payload

        const blog = await CheckEntityId.checkBlogId(this.BlogRepository, blogId, message)

        if(userId && blog.AccountData.userId !== userId)
            throw new HttpException('Forbidden', 403)

        await CheckEntityId.checkPostId(this.PostRepository, postId)

        await this.PostRepository
            .update({id: postId},
                {title, shortDescription, content,
                            blogName: blog.name})
    }

    async getCommentsForOnePost(id, payload, headers) {
        await CheckEntityId.checkPostId(this.PostRepository, id)
        const reactions = await EntityWithReactions
            .getCommentsInfo(this.CommentReactionsRepository)

        const {comments, pagesCount,
            pageNumber, pageSize, totalCount} = await commentsPS(this.CommentRepository, payload, id)
        let userId = await getUserId(headers)

        const viewComments = comments.map(comment => EntityUtils.createViewComment(comment, userId, reactions))

        return ({pagesCount, page: +pageNumber, pageSize, totalCount, items: viewComments})
    }

    async createCommentForPost(id, content, userId) {
        const post = await CheckEntityId.checkPostId(this.PostRepository, id)
        const user: User = await CheckEntityId.checkUserId(this.UserRepository, userId)

        //@ts-ignore
        if(await this.BlogBannedUsersRepository.findOneBy({blogId: post.blog.id, userId}))
            throw new HttpException('Forbidden', 403)

        const commentId = uuid.v4()
        const createdAt = new Date().toISOString()

        const {Comment, CommentatorInfo, LikesInfo} = await EntityUtils
            .CreateComment(content, id, userId,
                user.AccountData.login, commentId, createdAt)

        await this.CommentatorInfoRepository.save(CommentatorInfo)
        await this.LikesInfoRepository.save(LikesInfo)
        await this.CommentRepository.save(Comment)

        return EntityUtils.createViewComment(Comment, userId, [])
    }


    async updatePostLikeStatus(postId, likeStatus, userId) {
        await CheckEntityId.checkPostId(this.PostRepository, postId)
        const user: User = await CheckEntityId.checkUserId(this.UserRepository, userId)

        const previousStatus = await ReactionsUtils
            .findReaction(this.PostReactionsRepository,
                postId, userId)

        if(previousStatus === likeStatus) return
        else if(!previousStatus && likeStatus === 'None') return

        if (!previousStatus && likeStatus !== 'None') {
            await ReactionsUtils.addReaction(this.PostReactionsRepository,
                    userId, postId, likeStatus)

            if (likeStatus === 'Like') {
                console.log('NO REACTION CAME LIKE')
                await NewestLikesUtils
                    .addNewLike(this.NewestLikesRepository,
                        postId, userId, user.AccountData.login)

                await this.ExtendedLikesInfoRepository
                    .update(postId,
                    {likesCount: () => `likesCount + 1`})

            } else {
                console.log('NO REACTION CAME DISLIKE')
                await this.ExtendedLikesInfoRepository
                    .update(postId,
                    {dislikesCount: () => `dislikesCount + 1` })
            }
        }

        if (previousStatus === 'Like') {
            await NewestLikesUtils
                .deleteNewLike(this.NewestLikesRepository,
                    postId, userId)

            if (likeStatus === 'Dislike') {
                console.log('WAS LIKE CAME DISLIKE')
                await ReactionsUtils
                    .updateReactions(this.PostReactionsRepository,
                    postId, userId, likeStatus)

                await this.ExtendedLikesInfoRepository
                    .update(postId,
                    {likesCount: () => `likesCount - 1`,
                                dislikesCount: () => `dislikesCount + 1`})


            } else {
                console.log('WAS LIKE CAME NONE')
                await ReactionsUtils
                    .deleteReaction(this.PostReactionsRepository,
                        postId, userId)
                await this.ExtendedLikesInfoRepository
                    .update(postId,
                    {likesCount: () => `likesCount - 1` })
            }
        }

        if (previousStatus === 'Dislike') {
            if (likeStatus === 'Like') {
                console.log('WAS DISLIKE CAME LIKE')
                await ReactionsUtils
                    .updateReactions(this.PostReactionsRepository,
                        postId, userId, likeStatus)
                await NewestLikesUtils
                    .addNewLike(this.NewestLikesRepository,
                    postId, userId, user.AccountData.login)

                await this.ExtendedLikesInfoRepository
                    .update(postId,
                    {likesCount: () => `likesCount + 1`,
                                dislikesCount: () => `dislikesCount - 1`})

            } else {
                console.log('WAS DISLIKE CAME NONE')
                await ReactionsUtils
                    .deleteReaction(this.PostReactionsRepository,
                    postId, userId)

                await this.ExtendedLikesInfoRepository
                    .update(postId,
                        {dislikesCount: () => `dislikesCount - 1` })
            }
        }
    }
}