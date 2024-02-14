import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfigModule} from '@nestjs/config'
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserController} from "./Controllers/user.controller";
import {UserService} from "./Services/user.service";
import {ThrottlerGuard, ThrottlerModule} from "@nestjs/throttler";
import {LoginController} from "./Controllers/login.controller";
import {RegistrationController} from "./Controllers/registration.controller";
import {EmailController} from "./Controllers/email.controller";
import {DevicesService} from "./Services/devices.service";
import {DevicesController} from "./Controllers/devices.controller";
import {LoginService} from "./Services/login.service";
import {EmailService} from "./Services/email.service";
import {UsersModule} from "./Moduls/user.module";
import {DataSource} from "typeorm";
import {APP_GUARD} from "@nestjs/core";
import {BlogController} from "./Controllers/blogs.controller";
import {PostController} from "./Controllers/posts.controller";
import {BlogService} from "./Services/blogs.service";
import {PostService} from "./Services/posts.service";
import {CommentsController} from "./Controllers/comments.controller";
import {CommentsService} from "./Services/comments.service";
import {User} from "./Entities/User/UserEntity";
import {EmailConfirmation} from "./Entities/User/EmailConfirmationEntity";
import {AccountData} from "./Entities/User/AccountDataEntity";
import {Device} from "./Entities/DeviceEntity";
import {TokenBlackList} from "./Entities/Token/TokenBlackListEntity";
import {Blog} from "./Entities/BlogEntity";
import {Post} from "./Entities/Posts/PostEntity";
import {NewestLikes} from "./Entities/Posts/NewestLikesEntity";
import {ExtendedLikesInfo} from "./Entities/Posts/ExtendedLikesInfoEntity";
import {LikesInfo} from "./Entities/Comment/LikesInfoEntity";
import {Comment} from "./Entities/Comment/CommentEntity";
import {CommentatorInfo} from "./Entities/Comment/CommentatorInfoEntity";
import {CommentReactions} from "./Entities/Comment/CommentReactionsEntity";
import {PostReactions} from "./Entities/Posts/PostReactionsEntity";
import {QuizController} from "./Controllers/Quiz.controller";
import {QuizService} from "./Services/Quiz.service";
import {Question} from "./Entities/Quiz/QuestionEntity";
import {Player} from "./Entities/Quiz/PlayerEntity";
import { CorrectAnswers } from './Entities/Quiz/CorrectAnswersEntity';
import { PlayerProgress } from './Entities/Quiz/PlayerProgressEntity';
import { GameQuestions } from './Entities/Quiz/GameQuestionsEntity';
import { PairGame } from './Entities/Quiz/PairGameEntity';
import { GameController } from './Controllers/Game.controller';
import { GameService } from './Services/Game.service';
import { UserAnswers } from './Entities/Quiz/UserAnswersEntity';
import { Statistic } from './Entities/User/StatisticEntity';

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
                Statistic]
        }),
        TypeOrmModule.forFeature([User, EmailConfirmation,
            AccountData, Device, TokenBlackList, Blog, Post, NewestLikes,
            ExtendedLikesInfo, LikesInfo, Comment, CommentatorInfo, PostReactions,
            CommentReactions, Question, Player, CorrectAnswers, PlayerProgress,
        PairGame, GameQuestions, UserAnswers, Statistic]),
        UsersModule,
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 1000
        }]),
    ],
    controllers: [AppController, LoginController, RegistrationController,
        EmailController, DevicesController, BlogController, PostController, CommentsController,
    QuizController, GameController],
    providers: [{
        provide: APP_GUARD,
        useClass: ThrottlerGuard
    },
        AppService, LoginService, EmailService, DevicesService, UserService,
    BlogService, PostService, CommentsService, QuizService, GameService],
})
export class AppModule {
    constructor(private dataSource: DataSource) {}
}

