import {Injectable} from "@nestjs/common";
import {blogsT} from "../Types/types";
import {blogsPS, postsPS} from "../Utils/PaginationAndSort";
import * as uuid from 'uuid'
import {EntityUtils} from "../Utils/EntityUtils";
import {getUserId} from "../Utils/authentication";
import {InjectDataSource, InjectRepository} from "@nestjs/typeorm";
import {DataSource, Repository} from "typeorm";
import {CheckEntityId} from "../Utils/checkEntityId";
import {EntityWithReactions} from "../Utils/EntityWithReactions";
import {Blog, createBlog} from "../Entities/BlogEntity";
import {Post} from "../Entities/Posts/PostEntity";
import {ExtendedLikesInfo} from "../Entities/Posts/ExtendedLikesInfoEntity";
import {NewestLikes} from "../Entities/Posts/NewestLikesEntity";
import {PostReactions} from "../Entities/Posts/PostReactionsEntity";

@Injectable()
export class BlogService {
    constructor(@InjectRepository(Blog)
                protected BlogRepository: Repository<Blog>,
                @InjectRepository(Post)
                protected PostRepository: Repository<Post>,
                @InjectRepository(ExtendedLikesInfo)
                protected ExtendedLikesInfoRepository: Repository<ExtendedLikesInfo>,
                @InjectRepository(NewestLikes)
                protected NewestLikesRepository: Repository<NewestLikes>,
                @InjectRepository(PostReactions)
                protected PostReactionsRepository: Repository<PostReactions>) {
    }

    deleteAllBlogs() {
        return this.BlogRepository
            .update({}, {deleted: true})
    }

    async getAllBlogs(payload) {
        const {
            blogs, pagesCount, pageNumber,
            pageSize, totalCount
        } = await blogsPS(this.BlogRepository, payload)
        return ({pagesCount, page: +pageNumber, pageSize, totalCount, items: blogs})
    }

    async getOneBlog(id) {
        return await CheckEntityId
            .checkBlogId(this.BlogRepository, id, 'for blog')
    }

    async createBlog(name, description, websiteUrl): Promise<blogsT> {
        const id = uuid.v4()
        const createdAt = new Date().toISOString()

        const blog: createBlog =
            new createBlog(id, name, description, websiteUrl, createdAt)

        await this.BlogRepository.save(blog)

        const {deleted, ...viewBlog} = blog
        return viewBlog
    }

    async deleteBlog(id) {
        await CheckEntityId
            .checkBlogId(this.BlogRepository, id, 'for blog')
        await this.BlogRepository
            .update({id}, {deleted: true})
    }

    async updateBlog(id, updateBlogPayload) {
        const {name, description, websiteUrl} = updateBlogPayload
        await CheckEntityId
            .checkBlogId(this.BlogRepository, id, 'for blog')

        await this.BlogRepository
            .update({id}, {name, description, websiteUrl})
    }

    async getPostsForBlog(id, payload, headers) {
        const userId = await getUserId(headers)
        await CheckEntityId
            .checkBlogId(this.BlogRepository, id, 'for post')

        const {posts, pagesCount, pageNumber, pageSize, totalCount} =
            await postsPS(this.PostRepository, payload, id)

        const {reactions, newestLikes, extendedLikesInfo} =
            await EntityWithReactions
                .getPostsInfo(
                    this.NewestLikesRepository,
                    this.ExtendedLikesInfoRepository,
                    this.PostReactionsRepository)
        const items = posts.map(post =>
            EntityUtils.GetPost(post, newestLikes, reactions, extendedLikesInfo, userId))

        return ({pagesCount, page: +pageNumber, pageSize, totalCount, items})
    }
}