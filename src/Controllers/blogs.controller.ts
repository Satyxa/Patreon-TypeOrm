import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Headers,
    HttpCode,
    Param,
    Post,
    Put,
    Query,
    UseGuards
} from '@nestjs/common';
import {BlogService} from "../Services/blogs.service";
import {queryPayload} from "./user.controller";
import {PostService} from "../Services/posts.service";
import {BasicAuthGuard} from "../Middleware/AuthGuard";
import {
    createBlogPayloadClass,
    createdPostForBlogPayloadClass,
    createdPostPayloadClass,
    updatePostForBlogPayload
} from "../Types/classesTypes";
import {CheckEntityId} from "../Utils/checkEntityId";

@Controller()
export class BlogController {
    constructor(private readonly BlogService: BlogService, private readonly PostService: PostService) {}

    @Get('blogs')
    async getAllBlogs(@Query() payload: queryPayload) {
        return await this.BlogService.getAllBlogs(payload)
    }
    @Get('blogs/:id')
    async getOneBlog(@Param('id') id: string){
        if(!id) throw new BadRequestException([{message: 'id is required', field: 'id'}])
        return await this.BlogService.getOneBlog(id)
    }
    @UseGuards(BasicAuthGuard)
    @Post('sa/blogs')
    async createBlog(@Body() createBlogPayload: createBlogPayloadClass) {
        const {name, description, websiteUrl} = createBlogPayload
        return await this.BlogService.createBlog(name, description, websiteUrl)
    }
    @UseGuards(BasicAuthGuard)
    @Delete('sa/blogs/:id')
    @HttpCode(204)
    async deleteBlog(@Param('id') id: string) {
        if(!id) throw new BadRequestException(
            [{message: 'id is required', field: 'id'}])
        return await this.BlogService.deleteBlog(id)
    }
    @UseGuards(BasicAuthGuard)
    @Put('sa/blogs/:id')
    @HttpCode(204)
    async updateBlog(@Param('id') id: string,
                     @Body() updateBlogPayload: createBlogPayloadClass) {
        if(!id) throw new BadRequestException(
            [{message: 'id is required', field: 'id'}])
        return await this.BlogService.updateBlog(id, updateBlogPayload)
    }
    @Get('blogs/:id/posts')
    async getPostsForBlog(@Param('id') id: string,
                          @Query() payload: queryPayload,
                          @Headers() headers) {
        if(!id) throw new BadRequestException([{message: 'id is required', field: 'id'}])
        return await this.BlogService.getPostsForBlog(id, payload, headers)
    }
    @UseGuards(BasicAuthGuard)
    @Post('sa/blogs/:id/posts')
    async createPostForBlog(@Param('id') id: string, @Body() createdPostPayload: createdPostForBlogPayloadClass){
        if(!id) throw new BadRequestException([{message: 'id is required', field: 'id'}])
        createdPostPayload.blogId = id
        return await this.PostService.createPost(createdPostPayload)
    }

    @UseGuards(BasicAuthGuard)
    @Put('sa/blogs/:blogId/posts/:postId')
    async updatePostForBlog(@Param() updatePostParams: updatePostForBlogPayload,
                            @Body() updatePostPayload: createdPostForBlogPayloadClass){
        updatePostPayload.blogId = updatePostParams.blogId
        return await this.PostService.updatePost(updatePostParams.postId, updatePostPayload)
    }
    @UseGuards(BasicAuthGuard)
    @Delete('sa/blogs/:blogId/posts/:postId')
    async deletePostForBlog(@Param() updatePostParams: updatePostForBlogPayload){
        await this.PostService.deletePost(updatePostParams.postId, updatePostParams.blogId)
    }
    @UseGuards(BasicAuthGuard)
    @Get('sa/blogs')
    async SAGetAllBlogs(@Query() payload: queryPayload) {

        return await this.BlogService.getAllBlogs(payload)
    }
    @UseGuards(BasicAuthGuard)
    @Get('sa/blogs/:id')
    async SAGetOneBlog(@Param('id') id: string){
        if(!id) throw new BadRequestException([{message: 'id is required', field: 'id'}])
        return await this.BlogService.getOneBlog(id)
    }
    @UseGuards(BasicAuthGuard)
    @Get('sa/blogs/:id/posts')
    async SAGetPostsForBlog(@Param('id') id: string,
                          @Query() payload: queryPayload,
                          @Headers() headers) {
        console.log(1)
        if(!id) throw new BadRequestException([{message: 'id is required', field: 'id'}])
        return await this.BlogService.getPostsForBlog(id, payload, headers)
    }
}