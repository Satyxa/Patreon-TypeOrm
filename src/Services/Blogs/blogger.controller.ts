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
  BlogUserBannedStatusPayload,
  createBlogPayloadClass,
  createdPostForBlogPayloadClass, createdPostPayloadClass,
  updatePostForBlogPayload, UserBannedStatusPayload,
} from '../../Types/classesTypes';
import { BloggerService } from './blogger.service';

@Controller('blogger')
export class BloggerController {
  constructor(private readonly BloggerService: BloggerService,
              private readonly PostService: PostService,
              private readonly BlogService: BlogService) {}

  @UseGuards(AuthGuard)
  @Get('blogs')
  async getAllBlogs(@Query() payload: queryPayload,
                    @Req() req: any) {
    return await this.BlogService.getAllBlogs(payload, req.userId)
  }
  @UseGuards(AuthGuard)
  @Post('blogs')
  async createBlog(@Body() createBlogPayload: createBlogPayloadClass,
                   @Req() req: any) {
    const {name, description, websiteUrl} = createBlogPayload
    return await this.BloggerService.createBlog(name, description, websiteUrl, req.userId)
  }
  @UseGuards(AuthGuard)
  @Delete('blogs/:id')
  @HttpCode(204)
  async deleteBlog(@Param('id') id: string,
                   @Req() req: any) {
    if(!id) throw new BadRequestException(
      [{message: 'id is required', field: 'id'}])
    return await this.BloggerService.deleteBlog(id, req.userId)
  }
  @UseGuards(AuthGuard)
  @Put('blogs/:id')
  @HttpCode(204)
  async updateBlog(@Param('id') id: string,
                   @Body() updateBlogPayload: createBlogPayloadClass,
                   @Req() req: any) {
    if(!id) throw new BadRequestException(
      [{message: 'id is required', field: 'id'}])
    return await this.BloggerService.updateBlog(id, updateBlogPayload, req.userId)
  }
  @UseGuards(AuthGuard)
  @Get('blogs/:blogId/posts')
  async getPostsForBlog(@Param('blogId') blogId: string,
                        @Query() payload: queryPayload,
                        @Headers() headers) {
    if(!blogId) throw new BadRequestException(
      [{message: 'blogId is required', field: 'blogId'}])
    return await this.BlogService.getPostsForBlog(blogId, payload, headers, 'blogger')
  }
  @UseGuards(AuthGuard)
  @Post('blogs/:id/posts')
  async createPostForBlog(@Param('id') id: string,
                          @Body() createdPostPayload: createdPostForBlogPayloadClass,
                          @Req() req: any){
    if(!id) throw new BadRequestException([{message: 'id is required', field: 'id'}])
    createdPostPayload.blogId = id
    return await this.PostService.createPost(createdPostPayload, 'for blog', req.userId)
  }

  @UseGuards(AuthGuard)
  @Put('blogs/:blogId/posts/:postId')
  @HttpCode(204)
  async updatePostForBlog(@Param() updatePostParams: updatePostForBlogPayload,
                          @Body() updatePostPayload: createdPostForBlogPayloadClass,
                          @Req() req: any){

    updatePostPayload.blogId = updatePostParams.blogId
    if(!updatePostParams.postId || !updatePostParams.blogId)
      throw new HttpException('Not Found', 404)

    return await this.PostService
      .updatePost(updatePostParams.postId, updatePostPayload, 'for blog', req.userId)
  }
  @UseGuards(AuthGuard)
  @Delete('blogs/:blogId/posts/:postId')
  @HttpCode(204)
  async deletePostForBlog(@Param() updatePostParams: updatePostForBlogPayload,
                          @Req() req: any){
    await this.PostService.deletePost(updatePostParams.postId, updatePostParams.blogId, req.userId)
  }

  @UseGuards(AuthGuard)
  @Put('users/:id/ban')
  @HttpCode(204)
  async banUser(@Param('id') id: string,
                @Body() payload: BlogUserBannedStatusPayload) {
    await this.BloggerService.banUser(id, payload.isBanned, payload.banReason, payload.blogId)
}

@UseGuards(AuthGuard)
@Get('users/blog/:id')
@HttpCode(200)
async getBannedUsersForBlog(@Param("id") id: string) {
    await this.BloggerService.getBannedUsersForBlog(id)
}
}