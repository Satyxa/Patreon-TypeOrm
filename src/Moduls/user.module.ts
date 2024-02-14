import {Module} from "@nestjs/common";
import {UserService} from "../Services/user.service";
import {UserController} from "../Controllers/user.controller";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../Entities/User/UserEntity";
import {AccountData} from "../Entities/User/AccountDataEntity";
import {EmailConfirmation} from "../Entities/User/EmailConfirmationEntity";
import { Player } from '../Entities/Quiz/PlayerEntity';
import { Statistic } from '../Entities/User/StatisticEntity';
import { TokenBlackList } from '../Entities/Token/TokenBlackListEntity';

@Module({
    imports: [TypeOrmModule.forFeature([
      User, AccountData, EmailConfirmation, Player, Statistic, TokenBlackList])],
    providers: [UserService],
    controllers: [UserController],
})
export class UsersModule {}