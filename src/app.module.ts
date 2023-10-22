import {Module} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {UserController} from "./Controllers/user.controller";
import {UserService} from "./Services/user.service";
import {MongooseModule} from "@nestjs/mongoose";
import {User, UserSchema} from "./Mongoose/UserSchema";
import {BlogController} from "./Controllers/blog.controller";
import {BlogService} from "./Services/blog.service";
import {Blog, BlogSchema} from "./Mongoose/BlogSchema";
import {Post, PostSchema} from "./Mongoose/PostSchema";
import {PostController} from "./Controllers/post.controller";
import {PostService} from "./Services/post.service";
import {ConfigModule} from '@nestjs/config'
const mongoURI = process.env.MONGOURI || 'mongodb+srv://satyxa1919:m1Satyxa2on@clusterblog.jvi7su7.mongodb.net/patreon?retryWrites=true&w=majority'
@Module({
  imports: [
      ConfigModule.forRoot(),
    MongooseModule.forRoot(mongoURI),
      MongooseModule.forFeature([{
      name: User.name,
      schema: UserSchema
      }]),
      MongooseModule.forFeature([{
        name: Blog.name,
        schema: BlogSchema
      }]),
      MongooseModule.forFeature([{
      name: Post.name,
      schema: PostSchema
      }])
  ],
  controllers: [AppController, UserController, BlogController, PostController],
  providers: [AppService, UserService, BlogService, PostService],
})
export class AppModule {}
