import {Module} from "@nestjs/common";
import {UserService} from "../Services/user.service";
import {UserController} from "../Controllers/user.controller";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Users} from "../Schemes/UserSchema";

@Module({
    imports: [TypeOrmModule.forFeature([Users])],
    providers: [UserService],
    controllers: [UserController],
})
export class UsersModule {}