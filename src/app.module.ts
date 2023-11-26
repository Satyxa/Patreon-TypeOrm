import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
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
import {RegistrationController} from "./Controllers/registration.controller";
import {RegistrationService} from "./Services/registration.service";
import {LoginController} from "./Controllers/login.controller";
import {LoginService} from "./Services/login.service";
import {EmailService} from "./Services/email.service";
import {EmailController} from "./Controllers/email.controller";
import {CommentsController} from "./Controllers/comments.controller";
import {CommentsService} from "./Services/comments.service";
import {Comment, CommentSchema} from "./Mongoose/CommentSchema";
import {checkBlogId} from "./CustomValidate";
import {DevicesController} from "./Controllers/devices.controller";
import {DevicesService} from "./Services/devices.service";
import {TokenBlackList, TokenBlackListSchema} from "./Mongoose/TokenBlackListSchema";
import {ThrottlerModule} from "@nestjs/throttler";

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
        }]),
        MongooseModule.forFeature([{
            name: Comment.name,
            schema: CommentSchema
        }]),
        MongooseModule.forFeature([{
            name: TokenBlackList.name,
            schema: TokenBlackListSchema
        }]),
        ThrottlerModule.forRoot([
            {
                ttl: 60000,
                limit: 100
            }
        ]),
    ],
    controllers: [AppController, UserController, BlogController,
        PostController, RegistrationController, LoginController, EmailController,
        CommentsController, DevicesController],
    providers: [AppService, UserService, BlogService, PostService,
        RegistrationService, LoginService, EmailService,
        CommentsService, checkBlogId, DevicesService],
})
export class AppModule {
}
