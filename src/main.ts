import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {BadRequestException, Controller, Delete, HttpCode, ValidationPipe} from "@nestjs/common";
import { UserService } from "./Services/user.service";
import {HttpExceptionFilter} from "./Middleware/exception.filter";
import {ErrorsType} from "./Types/types";
import {BlogService} from "./Services/blog.service";
import {PostService} from "./Services/post.service";

@Controller('/delete-all')
class deleteAll {
  constructor(private readonly UserService: UserService,
              private readonly BlogService: BlogService,
              private readonly PostService: PostService) {}
  @Delete()
  @HttpCode(204)
  async deleteAll() {
    await this.UserService.deleteAllUsers();
    await this.PostService.deleteAllPosts();
    return this.BlogService.deleteAllBlogs()
  }
}

async function Server() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  app.useGlobalPipes(new ValidationPipe({exceptionFactory: (errors) => {
      console.log('exceptionFactory')
    const errorsForRes: ErrorsType[] = []
      console.log(1)
      errors.forEach((e) => {
        const zeroKey = Object.keys(e.constraints!)[0]
        console.log(2)
        errorsForRes.push({
          field: e.property,
          message: e.constraints![zeroKey]
        })
        console.log(3)
      })
      console.log('exceptionFactory')
      throw new BadRequestException(errorsForRes)
  }}))
  app.useGlobalFilters(new HttpExceptionFilter())
  await app.listen(1666);
}
Server();
