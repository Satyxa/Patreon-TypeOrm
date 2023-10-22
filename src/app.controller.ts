import {Controller, Delete, Get} from '@nestjs/common';
import { AppService } from './app.service';
import { UserService } from "./Services/user.service";
import { PostService } from "./Services/post.service";
import { BlogService } from "./Services/blog.service";

@Controller()
export class AppController {
  constructor(
      private readonly appService: AppService,
      private readonly UserService: UserService,
      private readonly PostService: PostService,
      private readonly BlogService: BlogService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Delete('/testing/all-data')
  async deleteAll() {
    await this.UserService.deleteAllUsers()
    await this.PostService.deleteAllPosts()
    await this.BlogService.deleteAllBlogs()
    return
  }
}
