import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Headers,
    HttpCode, HttpException,
    Param,
    Post,
    Put,
    Query, Req,
    UseGuards,
} from '@nestjs/common';
import {BlogService} from "./blogs.service";
import {queryPayload} from "../User/user.controller";
import {PostService} from "../Posts/posts.service";
import { AuthGuard, BasicAuthGuard } from '../../Middleware/Guards';
import {
    createBlogPayloadClass,
    createdPostForBlogPayloadClass, createdPostPayloadClass,
    updatePostForBlogPayload
} from "../../Types/classesTypes";

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
    @Get('blogs/:blogId/posts')
    async getPostsForBlog(@Param('blogId') blogId: string,
                          @Query() payload: queryPayload,
                          @Headers() headers) {
        if(!blogId) throw new BadRequestException(
            [{message: 'blogId is required', field: 'blogId'}])
        return await this.BlogService.getPostsForBlog(blogId, payload, headers)
    }

    @UseGuards(BasicAuthGuard)
    @Get('blogs')
    async SAGetAllBlogs(@Query() payload: queryPayload,
                        @Req() req: any) {
        return await this.BlogService.getAllBlogs(payload, req.userId)
    }
}