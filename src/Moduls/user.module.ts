import {Module} from "@nestjs/common";
import {UserService} from "../Services/User/user.service";
import {UserController} from "../Services/User/user.controller";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../Entities/User/User.entity";
import {AccountData} from "../Entities/User/AccountData.entity";
import {EmailConfirmation} from "../Entities/User/EmailConfirmation.entity";
import { Player } from '../Entities/Quiz/Player.entity';
import { Statistic } from '../Entities/User/Statistic.entity';
import { TokenBlackList } from '../Entities/Token/TokenBlackList.entity';
import { BanInfo } from '../Entities/User/BanInfo.entity';
import { LikesInfo } from '../Entities/Comment/LikesInfo.entity';
import { ExtendedLikesInfo } from '../Entities/Posts/ExtendedLikesInfo.entity';
import { CommentReactions } from '../Entities/Comment/CommentReactions.entity';
import { PostReactions } from '../Entities/Posts/PostReactions.entity';
import { NewestLikes } from '../Entities/Posts/NewestLikes.entity';

@Module({
    imports: [TypeOrmModule.forFeature([
      User, AccountData, EmailConfirmation, Player,
      Statistic, TokenBlackList, BanInfo, LikesInfo, ExtendedLikesInfo,
      CommentReactions, PostReactions, NewestLikes])],
    providers: [UserService],
    controllers: [UserController],
})
export class UsersModule {}