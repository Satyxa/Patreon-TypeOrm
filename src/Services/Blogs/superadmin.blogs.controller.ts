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
  BanBlogPayload,
  createBlogPayloadClass,
  createdPostForBlogPayloadClass, createdPostPayloadClass,
  updatePostForBlogPayload,
} from '../../Types/classesTypes';
import { SuperadminBlogsService } from './superadmin.blogs.service';

@Controller('sa')
export class SuperadminBlogsController {
  constructor(private readonly SuperadminBlogsService: SuperadminBlogsService,
              private readonly PostService: PostService) {}
  @Get('blogs')
  async getAllBlogs(@Query() payload: queryPayload) {
    return await this.SuperadminBlogsService.getAllBlogs(payload)
  }

  @UseGuards(BasicAuthGuard)
  @Put('blogs/:id/ban')
  @HttpCode(204)
  async banBlog(@Param('id') id: string,
                @Body() payload: BanBlogPayload) {
    await this.SuperadminBlogsService.banBlog(id, payload.isBanned)
  }
}