import {Controller, Delete, Get, HttpCode} from '@nestjs/common';
import { AppService } from './app.service';
import { UserService } from "./Services/user.service";
import {DevicesService} from "./Services/devices.service";
import {BlogService} from "./Services/blogs.service";
import {PostService} from "./Services/posts.service";
import {CommentsService} from "./Services/comments.service";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {QuizService} from "./Services/Quiz.service";
import { GameService } from './Services/Game.service';

@Controller()
export class AppController {
  constructor(
      private readonly appService: AppService,
      private readonly UserService: UserService,
      private readonly DevicesService: DevicesService,
      private readonly BlogService: BlogService,
      private readonly PostService: PostService,
      private readonly CommentsService: CommentsService,
      private readonly QuizService: QuizService,
      @InjectDataSource() protected dataSource: DataSource,
      private readonly GameService: GameService
  ) {}

  @Get()
  getHello(): string {
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
