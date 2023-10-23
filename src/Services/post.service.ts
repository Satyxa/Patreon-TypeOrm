
import {InjectModel} from "@nestjs/mongoose";
import {Post, PostDocument} from "../Mongoose/PostSchema";
import {Model} from "mongoose";
import {postsPS} from "../utils/PaginationAndSort";
import {EntityUtils} from "../utils/EntityUtils";
import {HttpException, Injectable} from "@nestjs/common";
import {blogsT, postT} from "../types";
import {Blog, BlogDocument} from "../Mongoose/BlogSchema";

@Injectable()
export class PostService {
    constructor(@InjectModel(Post.name) private PostModel: Model<PostDocument>, @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>) {}
    deleteAllPosts(): any {
        return this.PostModel.deleteMany({})
    }

    async getAllPosts(payload): Promise<any> {
        const {posts, pagesCount, pageNumber, pageSize, totalCount} = await postsPS(this.PostModel, payload, {})
        let userId = ''
        // if(req.headers.authorization) {
        //     const accessToken = req.headers.authorization.split(' ')[1]
        //     userId = getUserIdByToken(accessToken)
        // }
        const viewPosts = posts.map(post => {
            return EntityUtils.GetPost(post, userId)
        })
        return ({
            pagesCount, page: pageNumber, pageSize,
            totalCount, items: viewPosts})
    }
    async getOnePost(id): Promise<PostDocument | null> {
        let userId = ''
        const post = await this.PostModel.findOne({id}, { projection : { _id:0, comments: 0}}).lean()
        if(!post) throw new HttpException('Not Found', 404)
        return EntityUtils.GetPost(post, userId)
    }
    async createPost(payload) {
        const {title, shortDescription, content, blogId} = payload
        const blog: blogsT | null = await this.BlogModel.findOne({id: blogId})
        if(!blog) return

        const newPost: postT = EntityUtils.CreatePost(title, shortDescription, content, blogId, blog.name)

        const createdPost =  new this.PostModel(newPost)
        await createdPost.save()

        const {comments, reactions, ...post} = newPost

        return post
    }
    async deletePost(id) {
        const post = await this.PostModel.findOne({id})
        if(!post) throw new HttpException('Not Found', 404)
        await this.PostModel.deleteOne({id})
    }
    async updatePost(id, payload){
        const {title, shortDescription, content, blogId} = payload
        const post = await this.PostModel.findOne({id})
        const blog: blogsT | null = await this.BlogModel.findOne({id: blogId})
        if (!blog || !post) throw new HttpException('Not Found', 404)
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
}