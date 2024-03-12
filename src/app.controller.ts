import {Controller, Delete, Get, HttpCode} from '@nestjs/common';
import { AppService } from './app.service';
import { UserService } from "./Services/User/user.service";
import {DevicesService} from "./Services/User/devices.service";
import {BlogService} from "./Services/Blogs/blogs.service";
import {PostService} from "./Services/Posts/posts.service";
import {CommentsService} from "./Services/Posts/comments.service";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {QuestionService} from "./Services/Game/Question.service";
import { GameService } from './Services/Game/Game.service';
import { dirname } from 'path';
import * as path from 'path';

@Controller()
export class AppController {
  constructor(
      private readonly appService: AppService,
      private readonly UserService: UserService,
      private readonly DevicesService: DevicesService,
      private readonly BlogService: BlogService,
      private readonly PostService: PostService,
      private readonly CommentsService: CommentsService,
      private readonly QuizService: QuestionService,
      @InjectDataSource() protected dataSource: DataSource,
      private readonly GameService: GameService
  ) {}

  @Get()
  getHello(): string {
    console.log(__dirname);
    return this.appService.getHello();
  }
  @Delete('testing/all-data')
  @HttpCode(204)
  async deleteAll() {
    await this.UserService.deleteAll()
    await this.DevicesService.deleteAll()
    await this.PostService.deleteAllPosts()
    await this.BlogService.deleteAllBlogs()
    await this.CommentsService.deleteAll()
    await this.QuizService.deleteAll()
    await this.GameService.deleteAll()
  }

}
