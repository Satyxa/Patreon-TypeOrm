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
import {PostService} from "./posts.service";
import {AuthGuard, BasicAuthGuard} from "../../Middleware/Guards";
import {CommentContentClass, createdPostPayloadClass, LikesPayloadClass} from "../../Types/classesTypes";

type queryPayload = {
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string
}

@Controller('posts')
export class PostController {
    constructor(private readonly PostService: PostService) {}

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
    @UseGuards(BasicAuthGuard)
    @Post()
    async createPost(@Body() createdPostPayload: createdPostPayloadClass) {
        return await this.PostService.createPost(createdPostPayload)
    }
    @UseGuards(BasicAuthGuard)
    @Delete(':id')
    @HttpCode(204)
    async deletePost(@Param('id') id: string) {
        if(!id) throw new BadRequestException(
            [{message: 'id is required', field: 'id'}])
        return await this.PostService.deletePost(id)
    }
    //
    @UseGuards(BasicAuthGuard)
    @Put(':id')
    @HttpCode(204)
    async updatePost(@Param('id') id: string,
                     @Body() updatePostPayload: createdPostPayloadClass) {
        if(!id) throw new BadRequestException([{message: 'id is required', field: 'id'}])
        return await this.PostService.updatePost(id, updatePostPayload)
    }

    // LIKES FOR POST

    @UseGuards(AuthGuard)
    @Put(':id/like-status')
    @HttpCode(204)
    async updatePostLikeStatus(@Param('id') id: string,
                               @Body() likesPayload: LikesPayloadClass,
                               @Req() req: any) {
        if(!id) throw new BadRequestException([{message: 'id is required', field: 'id'}])
        return await this.PostService.updatePostLikeStatus(id, likesPayload.likeStatus, req.userId)
    }

    // LIKES FOR POSTT


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
                               @Body() CommentContentPayload: CommentContentClass,
                               @Req() req: any) {
        if(!id) throw new BadRequestException([{message: 'id is required', field: 'id'}])
        return this.PostService.createCommentForPost(id, CommentContentPayload.content, req.userId)
    }
}