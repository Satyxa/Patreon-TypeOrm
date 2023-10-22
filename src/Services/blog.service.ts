import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Blog, BlogDocument} from "../Mongoose/BlogSchema";
import {FilterQuery, Model} from "mongoose";
import {blogsT, postT} from "../types";
import {blogsPS, getValuesPS, postsPS} from "../utils/PaginationAndSort";
import * as uuid from 'uuid'
import {Post, PostDocument} from "../Mongoose/PostSchema";
import {EntityUtils} from "../utils/EntityUtils";
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
        return this.BlogModel.findOne({id}, {_id: 0, __v: 0})
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
       await this.BlogModel.findOneAndDelete({id})
    }

    async updateBlog(id, updateBlogPayload) {
        const {name, description, websiteUrl} = updateBlogPayload

        await this.BlogModel.findOneAndUpdate({id}, {$set: {
                name, description, websiteUrl
            }})
    }

    async getPostsForBlog(id, payload) {
        let userId = ''
        const filter = {blogId: id}

        let {posts, pageNumber, pageSize} = await postsPS(this.PostModel, payload, filter)
        const totalCount = posts.length
        const pagesCount = Math.ceil(totalCount / pageSize)

        const viewPosts = posts.map(post => {
            return EntityUtils.GetPost(post, userId)
        })
        return ({pagesCount, page: +pageNumber, pageSize, totalCount, items: viewPosts})
    }

}