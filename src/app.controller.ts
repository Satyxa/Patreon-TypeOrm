import {Controller, Delete, Get, HttpCode} from '@nestjs/common';
import { AppService } from './app.service';
import { UserService } from "./Services/user.service";
import {DevicesService} from "./Services/devices.service";
import {BlogService} from "./Services/blogs.service";
import {PostService} from "./Services/posts.service";

@Controller()
export class AppController {
  constructor(
      private readonly appService: AppService,
      private readonly UserService: UserService,
      private readonly DevicesService: DevicesService,
      private readonly BlogService: BlogService,
      private readonly PostService: PostService
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
  }

}
