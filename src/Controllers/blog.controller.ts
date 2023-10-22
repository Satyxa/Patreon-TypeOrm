import {Body, Controller, Delete, Get, Param, Post, Put, Query} from '@nestjs/common';
import {BlogService} from "../Services/blog.service";
import {queryPayload} from "./user.controller";
import {Blog} from "../Mongoose/BlogSchema";
import {createdPostPayloadType} from "./post.controller";
import {PostService} from "../Services/post.service";

type createBlogPayloadType = {
    name: string,
    description: string,
    websiteUrl: string
}

@Controller('blogs')
export class BlogController {
    constructor(private readonly BlogService: BlogService, private readonly PostService: PostService) {}

    @Get()
    async getAllBlogs(@Query() payload: queryPayload) {
        console.log(1)
        return await this.BlogService.getAllBlogs(payload)
    }
    @Get(':id')
    async getOneBlog(@Param('id') id: string): Promise<Blog | null>{
        return await this.BlogService.getOneBlog(id)
    }
    @Post()
    async createBlog(@Body() createBlogPayload: createBlogPayloadType) {
        const {name, description, websiteUrl} = createBlogPayload
        return this.BlogService.createBlog(name, description, websiteUrl)
    }
    @Delete(':id')
    async deleteBlog(@Param('id') id: string) {
        return await this.BlogService.deleteBlog(id)
    }
    @Put(':id')
    async updateBlog(@Param('id') id: string, @Body() updateBlogPayload: createBlogPayloadType) {
        return await this.BlogService.updateBlog(id, updateBlogPayload)
    }
    @Get(':id/posts')
    async getPostsForBlog(@Param('id') id: string, @Query() payload: queryPayload ) {
        return await this.BlogService.getPostsForBlog(id, payload)
    }
    @Post(':id/posts')
    async createPostForBlog(@Param('id') id: string, @Body() createdPostPayload: createdPostPayloadType){
        createdPostPayload.blogId = id
        return await this.PostService.createPost(createdPostPayload)
    }
}