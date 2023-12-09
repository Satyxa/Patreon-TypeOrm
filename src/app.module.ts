import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfigModule} from '@nestjs/config'
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserModule} from "./Moduls/user.module";
import {UserController} from "./Controllers/user.controller";
import {UserService} from "./Services/user.service";
import {ThrottlerModule} from "@nestjs/throttler";
import {LoginController} from "./Controllers/login.controller";
import {RegistrationController} from "./Controllers/registration.controller";
import {EmailController} from "./Controllers/email.controller";
import {DevicesService} from "./Services/devices.service";
import {DevicesController} from "./Controllers/devices.controller";
import {LoginService} from "./Services/login.service";
import {EmailService} from "./Services/email.service";


@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: "postgres",
            host: 'ep-old-bush-02389267.us-east-2.aws.neon.tech',
            port: 5432,
            username: 'Satyxa',
            password: 'l8tvZFa5QNuV',
            database: 'Patreon',
            autoLoadEntities: false,
            synchronize: false,
            ssl: true
        }),
        UserModule,
        ThrottlerModule.forRoot([{
                ttl: 60000,
                limit: 100
            }]),
    ],
    controllers: [AppController, UserController, LoginController, RegistrationController,
    EmailController, DevicesController],
    providers: [AppService, UserService, LoginService, EmailService, DevicesService],
})
export class AppModule {}
