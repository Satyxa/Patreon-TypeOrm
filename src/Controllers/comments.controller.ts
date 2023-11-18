import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Post,
    Put,
    Query,
    Headers,
    Req,
    UseGuards
} from '@nestjs/common';
import {PostService} from "../Services/post.service";
import {CommentsService} from "../Services/comments.service";
import {AuthGuard} from "../Middleware/AuthGuard";

type createBlogPayloadType = {
    name: string,
    description: string,
    websiteUrl: string
}

@Controller('comments')
export class CommentsController {
    constructor(private readonly CommentsService: CommentsService, private readonly PostService: PostService) {
    }

    @Get(':id')
    async getComment(@Param('id') id: string,
                     @Headers() headers) {
        return await this.CommentsService.getComment(id, headers)
    }

    @UseGuards(AuthGuard)
    @Put(':id')
    @HttpCode(204)
    async updateContent(@Param('id') id: string,
                        @Body('content') content: string,
                        @Req() req: any) {
        return await this.CommentsService.updateContent(id, req.userId, content)
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    @HttpCode(204)
    async deleteComment(@Param('id') id: string,
                        @Req() req: any) {
        return await this.CommentsService.deleteComment(id, req.userId)
    }

    @UseGuards(AuthGuard)
    @Put(':id/like-status')
    @HttpCode(204)
    async updateLikeStatus(@Param('id') id: string,
                        @Body('likeStatus') likeStatus: string,
                        @Req() req: any) {
        return await this.CommentsService.updateLikeStatus(id, likeStatus, req.userId)
    }

}