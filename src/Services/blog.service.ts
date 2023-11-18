import {HttpCode, HttpException, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Blog, BlogDocument} from "../Mongoose/BlogSchema";
import {FilterQuery, Model} from "mongoose";
import {blogsT, postT} from "../Types/types";
import {blogsPS, getValuesPS, postsPS} from "../Utils/PaginationAndSort";
import * as uuid from 'uuid'
import {Post, PostDocument} from "../Mongoose/PostSchema";
import {EntityUtils} from "../Utils/EntityUtils";
import {getResultByToken} from "../Utils/authentication";
@Injectable()
export class BlogService {
    constructor(
        @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
        @InjectModel(Post.name) private PostModel: Model<PostDocument>
    ) {}
    deleteAllBlogs(): Promise<any> { return this.BlogModel.deleteMany({}) }

    async getAllBlogs(payload): Promise<any> {
        const {blogs, pagesCount, pageNumber,
            pageSize, totalCount} = await blogsPS(this.BlogModel, payload)
        return ({pagesCount, page: +pageNumber, pageSize, totalCount, items: blogs})
    }
    async getOneBlog(id): Promise<Blog | null> {
        const blog = await this.BlogModel.findOne({id}, {_id: 0, __v: 0})
        if(!blog) throw new HttpException('Not Found', 404)
        return blog
    }

    async createBlog(name, description, websiteUrl): Promise<blogsT> {
    const id = uuid.v4()
    const createdAt = new Date().toISOString()

        const blog = {
            id,
            name,
            description,
            websiteUrl,
            isMembership: false,
            createdAt
        }

        const createdBlog = new this.BlogModel(blog)
        await createdBlog.save()
        return blog
    }
    async deleteBlog(id){
        const blog = await this.BlogModel.findOne({id})
        if(!blog) throw new HttpException('Not Found', 404)
       await this.BlogModel.deleteOne({id})
    }

    async updateBlog(id, updateBlogPayload) {
        const {name, description, websiteUrl} = updateBlogPayload
        const blog = await this.BlogModel.findOne({id})
        if(!blog) throw new HttpException('Not Found', 404)
        await this.BlogModel.updateOne({id}, {$set: {
                name, description, websiteUrl
            }})
    }

    async getPostsForBlog(id, payload, headers) {
        let userId = ''
        const filter = {blogId: id}

        if(headers.authorization){
            const accessToken = headers.authorization.split(' ')[1]
            const result = getResultByToken(accessToken)
            if(result) userId = result.userId
        }
        const blog = await this.BlogModel.findOne({id})
        if(!blog) throw new HttpException('Not Found', 404)
        let {posts, pagesCount, pageNumber, pageSize, totalCount} = await postsPS(this.PostModel, payload, filter)

        const viewPosts = posts.map(post => {
            return EntityUtils.GetPost(post, userId)
        })
        return ({pagesCount, page: +pageNumber, pageSize, totalCount, items: viewPosts})
    }

}