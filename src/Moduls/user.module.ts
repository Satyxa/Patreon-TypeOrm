import {Module} from "@nestjs/common";
import {UserService} from "../Services/user.service";
import {UserController} from "../Controllers/user.controller";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../Entities/User/UserEntity";
import {AccountData} from "../Entities/User/AccountDataEntity";
import {EmailConfirmation} from "../Entities/User/EmailConfirmationEntity";

@Module({
    imports: [TypeOrmModule.forFeature([User, AccountData, EmailConfirmation])],
    providers: [UserService],
    controllers: [UserController],
})
export class UsersModule {}