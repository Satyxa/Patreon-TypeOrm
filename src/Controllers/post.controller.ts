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
    Req,
    UseGuards
} from '@nestjs/common';
import {PostService} from "../Services/post.service";
import {AuthGuard} from "../Middleware/AuthGuard";
import {createdPostPayloadClass} from "../Types/classesTypes";

type queryPayload = {
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string
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
        if(!id) throw new BadRequestException([{message: 'id is required', field: 'id'}])
        return await this.PostService.getOnePost(id, headers)
    }

    @Post()
    async createPost(@Body() createdPostPayload: createdPostPayloadClass) {
        return await this.PostService.createPost(createdPostPayload)
    }

    @Delete(':id')
    @HttpCode(204)
    async deletePost(@Param('id') id: string) {
        if(!id) throw new BadRequestException([{message: 'id is required', field: 'id'}])
        return await this.PostService.deletePost(id)
    }

    @Put(':id')
    @HttpCode(204)
    async updatePost(@Param('id') id: string, @Body() updatePostPayload: createdPostPayloadClass) {
        if(!id) throw new BadRequestException([{message: 'id is required', field: 'id'}])
        return await this.PostService.updatePost(id, updatePostPayload)
    }

    // LIKES FOR POST

    @UseGuards(AuthGuard)
    @Put(':id/like-status')
    @HttpCode(204)
    async updatePostLikeStatus(@Param('id') id: string,
                               @Body('likeStatus') likeStatus: string,
                               @Req() req: any) {
        if(!id) throw new BadRequestException([{message: 'id is required', field: 'id'}])
        return await this.PostService.updatePostLikeStatus(id, likeStatus, req.userId)
    }

    // LIKES FOR POST


    // COMMENTS
    @Get(':id/comments')
    async getAllCommentsForPost(@Param('id') id: string,
                                @Query() payload: queryPayload,
                                @Headers() headers) {
        if(!id) throw new BadRequestException([{message: 'id is required', field: 'id'}])
        return this.PostService.getCommentsForOnePost(id, payload, headers)
    }

    @UseGuards(AuthGuard)
    @Post(':id/comments')
    async createCommentForPost(@Param('id') id: string,
                               @Body('content') content: string,
                               @Req() req: any) {
        if(!id) throw new BadRequestException([{message: 'id is required', field: 'id'}])
        return this.PostService.createCommentForPost(id, content, req.userId)
    }

    // COMMENTS
}