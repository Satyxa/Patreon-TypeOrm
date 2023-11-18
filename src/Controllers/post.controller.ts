import {
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
    Req,
    UseGuards
} from '@nestjs/common';
import {PostService} from "../Services/post.service";
import {AuthGuard} from "../Middleware/AuthGuard";

type queryPayload = {
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string
}

export type createdPostPayloadType = {
    title: string,
    shortDescription: string,
    content: string,
    blogId?: string
}

@Controller('posts')
export class PostController {
    constructor(private readonly PostService: PostService) {
    }

    @Get()
    async getAllPosts(@Query() payload: queryPayload,
                      @Headers() headers) {
        return await this.PostService.getAllPosts(payload, headers)
    }

    @Get(':id')
    async getOnePost(@Param('id') id: string,
                     @Headers() headers) {
        return await this.PostService.getOnePost(id, headers)
    }

    @Post()
    async createPost(@Body() createdPostPayload: createdPostPayloadType) {
        return await this.PostService.createPost(createdPostPayload)
    }

    @Delete(':id')
    @HttpCode(204)
    async deletePost(@Param('id') id: string) {
        return await this.PostService.deletePost(id)
    }

    @Put(':id')
    @HttpCode(204)
    async updatePost(@Param('id') id: string, @Body() updatePostPayload: createdPostPayloadType) {
        return await this.PostService.updatePost(id, updatePostPayload)
    }

    // LIKES FOR POST

    @UseGuards(AuthGuard)
    @Put(':id/like-status')
    @HttpCode(204)
    async updatePostLikeStatus(@Param('id') id: string,
                               @Body('likeStatus') likeStatus: string,
                               @Req() req: any) {
        return await this.PostService.updatePostLikeStatus(id, likeStatus, req.userId)
    }

    // LIKES FOR POST


    // COMMENTS
    @Get(':id/comments')
    async getAllCommentsForPost(@Param('id') id: string,
                                @Query() payload: queryPayload,
                                @Headers() headers) {
        return this.PostService.getCommentsForOnePost(id, payload, headers)
    }

    @UseGuards(AuthGuard)
    @Post(':id/comments')
    async createCommentForPost(@Param('id') id: string,
                               @Body('content') content: string,
                               @Req() req: any) {
        return this.PostService.createCommentForPost(id, content, req.userId)
    }

    // COMMENTS
}