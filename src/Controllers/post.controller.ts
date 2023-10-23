import {Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query} from '@nestjs/common';
import {PostService} from "../Services/post.service";

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
    constructor(private readonly PostService: PostService) {}

    @Get()
    async getAllPosts(@Query() payload: queryPayload) {
        return await this.PostService.getAllPosts(payload)
    }
    @Get(':id')
    async getOnePost(@Param('id') id: string){
        return await this.PostService.getOnePost(id)
    }
    @Post()
    async createPost(@Body() createdPostPayload: createdPostPayloadType) {
        return await this.PostService.createPost(createdPostPayload)
    }
    @Delete(':id')
    @HttpCode(204)
    async deletePost(@Param('id') id: string){
        return await this.PostService.deletePost(id)
    }
    @Put(':id')
    @HttpCode(204)
    async updatePost(@Param('id') id: string, @Body() updatePostPayload: createdPostPayloadType){
        return await this.PostService.updatePost(id, updatePostPayload)
    }
}