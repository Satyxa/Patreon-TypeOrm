import {HttpCode, HttpException, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {FilterQuery, Model} from "mongoose";
import {blogsT, postT} from "../Types/types";
import {blogsPS, getValuesPS, postsPS} from "../Utils/PaginationAndSort";
import * as uuid from 'uuid'
import {EntityUtils} from "../Utils/EntityUtils";
import {getResultByToken, getUserId} from "../Utils/authentication";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {CheckEntityId} from "../Utils/checkEntityId";
import {EntityWithReactions} from "../Utils/EntityWithReactions";
@Injectable()
export class BlogService {
    constructor(@InjectDataSource() protected dataSource: DataSource) {}
    deleteAllBlogs() {
        return this.dataSource
            .query(`DELETE FROM "Blogs"`)
    }

    async getAllBlogs(payload) {
        const {blogs, pagesCount, pageNumber,
            pageSize, totalCount} = await blogsPS(this.dataSource, payload)
        return ({pagesCount, page: +pageNumber, pageSize, totalCount, items: blogs})
    }
    async getOneBlog(id) {
        return await CheckEntityId.checkBlogId(this.dataSource, id, 'for blog')
    }

    async createBlog(name, description, websiteUrl): Promise<blogsT> {
        const id = uuid.v4()
        const createdAt = new Date().toISOString()

        await this.dataSource.query(`
        INSERT INTO "Blogs" ("id", "name",
        "description", "websiteUrl", 
        "isMembership", "createdAt")
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, name, description,
        websiteUrl, false, createdAt])

        return EntityUtils.createBlog(id, name, description,
                            websiteUrl, createdAt)
    }
    async deleteBlog(id){
        await CheckEntityId.checkBlogId(this.dataSource, id, 'for blog')
        await this.dataSource.query(`
        DELETE FROM "Blogs" where id = $1
        `, [id])
    }

    async updateBlog(id, updateBlogPayload) {
        const {name, description, websiteUrl} = updateBlogPayload
        await CheckEntityId.checkBlogId(this.dataSource, id, 'for blog')

        await this.dataSource.query(`
        UPDATE "Blogs" SET name = $1,
        description = $2, "websiteUrl" = $3`,
        [name, description, websiteUrl])
    }

    async getPostsForBlog(id, payload, headers) {
        const userId = await getUserId(headers)
        await CheckEntityId
            .checkBlogId(this.dataSource, id, 'for post')
        console.log(2)
        let {posts, pagesCount, pageNumber, pageSize, totalCount} = await postsPS(this.dataSource, payload, id)
        const {reactions, newestLikes} = await EntityWithReactions.getPostsInfo(this.dataSource)
        console.log(3)
        const viewPosts = posts.map(post =>
            EntityUtils.GetPost(post, userId, reactions, newestLikes)
        )
        console.log(4)
        return ({pagesCount, page: +pageNumber, pageSize, totalCount, items: viewPosts})
    }

}