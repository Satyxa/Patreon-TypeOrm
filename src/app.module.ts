import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfigModule} from '@nestjs/config'
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserController} from "./Services/User/user.controller";
import {UserService} from "./Services/User/user.service";
import {ThrottlerGuard, ThrottlerModule} from "@nestjs/throttler";
import {LoginController} from "./Services/User/login.controller";
import {RegistrationController} from "./Services/User/registration.controller";
import {EmailController} from "./Services/User/email.controller";
import {DevicesService} from "./Services/User/devices.service";
import {DevicesController} from "./Services/User/devices.controller";
import {LoginService} from "./Services/User/login.service";
import {EmailService} from "./Services/User/email.service";
import {UsersModule} from "./Moduls/user.module";
import {DataSource} from "typeorm";
import {APP_GUARD} from "@nestjs/core";
import {BlogController} from "./Services/Blogs/blogs.controller";
import {PostController} from "./Services/Posts/posts.controller";
import {BlogService} from "./Services/Blogs/blogs.service";
import {PostService} from "./Services/Posts/posts.service";
import {CommentsController} from "./Services/Posts/comments.controller";
import {CommentsService} from "./Services/Posts/comments.service";
import {User} from "./Entities/User/User.entity";
import {EmailConfirmation} from "./Entities/User/EmailConfirmation.entity";
import {AccountData} from "./Entities/User/AccountData.entity";
import {Device} from "./Entities/User/Device.entity";
import {TokenBlackList} from "./Entities/Token/TokenBlackList.entity";
import {Blog} from "./Entities/Blog/Blog.entity";
import {Post} from "./Entities/Posts/Post.entity";
import {NewestLikes} from "./Entities/Posts/NewestLikes.entity";
import {ExtendedLikesInfo} from "./Entities/Posts/ExtendedLikesInfo.entity";
import {LikesInfo} from "./Entities/Comment/LikesInfo.entity";
import {Comment} from "./Entities/Comment/Comment.entity";
import {CommentatorInfo} from "./Entities/Comment/CommentatorInfo.entity";
import {CommentReactions} from "./Entities/Comment/CommentReactions.entity";
import {PostReactions} from "./Entities/Posts/PostReactions.entity";
import {QuizController} from "./Services/Game/Quiz.controller";
import {QuestionService} from "./Services/Game/Question.service";
import {Question} from "./Entities/Quiz/Question.entity";
import {Player} from "./Entities/Quiz/Player.entity";
import { CorrectAnswers } from './Entities/Quiz/CorrectAnswers.entity';
import { PlayerProgress } from './Entities/Quiz/PlayerProgress.entity';
import { GameQuestions } from './Entities/Quiz/GameQuestions.entity';
import { PairGame } from './Entities/Quiz/PairGame.entity';
import { GameController } from './Services/Game/Game.controller';
import { GameService } from './Services/Game/Game.service';
import { UserAnswers } from './Entities/Quiz/UserAnswers.entity';
import { Statistic } from './Entities/User/Statistic.entity';
import { BloggerController } from './Services/Blogs/blogger.controller';
import { BloggerService } from './Services/Blogs/blogger.service';
import { SuperadminBlogsService } from './Services/Blogs/superadmin.blogs.service';
import { SuperadminBlogsController } from './Services/Blogs/superadmin.blogs.controller';
import { BanInfo } from './Entities/User/BanInfo.entity';
import { BlogBannedUsers } from './Entities/Blog/BlogBannedUsers.entity';

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        TypeOrmModule.forRoot({
            type: "postgres",
            host: 'localhost',
            port: 5432,
            username: 'satyxa',
            password: 'satyxa',
            database: 'Patreon-typeorm',
            autoLoadEntities: true,
            synchronize: true,
            entities: [User, EmailConfirmation, AccountData, Device,
                TokenBlackList, Blog, Post, NewestLikes, ExtendedLikesInfo,
                LikesInfo, Comment, CommentatorInfo, PostController,
                CommentReactions, Question, Player, CorrectAnswers,
                PlayerProgress, GameQuestions, PairGame, UserAnswers,
                Statistic, BanInfo, BlogBannedUsers]
        }),
        TypeOrmModule.forFeature([User, EmailConfirmation,
            AccountData, Device, TokenBlackList, Blog, Post, NewestLikes,
            ExtendedLikesInfo, LikesInfo, Comment, CommentatorInfo, PostReactions,
            CommentReactions, Question, Player, CorrectAnswers, PlayerProgress,
        PairGame, GameQuestions, UserAnswers, Statistic, BanInfo,
        BlogBannedUsers]),
        UsersModule,
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 1000
        }]),
    ],
    controllers: [AppController, LoginController, RegistrationController,
        EmailController, DevicesController, BlogController, PostController, CommentsController,
    QuizController, GameController, BloggerController, SuperadminBlogsController],
    providers: [{
        provide: APP_GUARD,
        useClass: ThrottlerGuard
    },
        AppService, LoginService, EmailService, DevicesService, UserService,
    BlogService, PostService, CommentsService, QuestionService, GameService,
    BloggerService, SuperadminBlogsService],
})
export class AppModule {
    constructor(private dataSource: DataSource) {}
}

