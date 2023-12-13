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
import {createBlogPayloadClass, createdPostForBlogPayloadClass} from "../Types/classesTypes";


@Controller('blogs')
export class BlogController {
    constructor(private readonly BlogService: BlogService, private readonly PostService: PostService) {}

    @Get()
    async getAllBlogs(@Query() payload: queryPayload) {
        return await this.BlogService.getAllBlogs(payload)
    }
    @Get(':id')
    async getOneBlog(@Param('id') id: string): Promise<Blog | null>{
        if(!id) throw new BadRequestException([{message: 'id is required', field: 'id'}])
        return await this.BlogService.getOneBlog(id)
    }
    @UseGuards(BasicAuthGuard)
    @Post()
    async createBlog(@Body() createBlogPayload: createBlogPayloadClass) {
        const {name, description, websiteUrl} = createBlogPayload
        return await this.BlogService.createBlog(name, description, websiteUrl)
    }
    @UseGuards(BasicAuthGuard)
    @Delete(':id')
    @HttpCode(204)
    async deleteBlog(@Param('id') id: string) {
        if(!id) throw new BadRequestException(
            [{message: 'id is required', field: 'id'}])
        return await this.BlogService.deleteBlog(id)
    }
    @UseGuards(BasicAuthGuard)
    @Put(':id')
    @HttpCode(204)
    async updateBlog(@Param('id') id: string,
                     @Body() updateBlogPayload: createBlogPayloadClass) {
        if(!id) throw new BadRequestException(
            [{message: 'id is required', field: 'id'}])
        return await this.BlogService.updateBlog(id, updateBlogPayload)
    }
    // @Get(':id/posts')
    // async getPostsForBlog(@Param('id') id: string,
    //                       @Query() payload: queryPayload,
    //                       @Headers() headers) {
    //     if(!id) throw new BadRequestException([{message: 'id is required', field: 'id'}])
    //     return await this.BlogService.getPostsForBlog(id, payload, headers)
    // }
    // @UseGuards(BasicAuthGuard)
    // @Post(':id/posts')
    // async createPostForBlog(@Param('id') id: string, @Body() createdPostPayload: createdPostForBlogPayloadClass){
    //     if(!id) throw new BadRequestException([{message: 'id is required', field: 'id'}])
    //     createdPostPayload.blogId = id
    //     return await this.PostService.createPost(createdPostPayload)
    // }
}