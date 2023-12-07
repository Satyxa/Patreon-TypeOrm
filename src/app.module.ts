import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfigModule} from '@nestjs/config'
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserModule} from "./Moduls/user.module";
import {UserController} from "./Controllers/user.controller";
import {UserService} from "./Services/user.service";
import {ThrottlerModule} from "@nestjs/throttler";


@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: "postgres",
            host: 'localhost',
            port: 5432,
            username: 'satyxa',
            password: 'satyxa',
            database: 'Patreon',
            autoLoadEntities: false,
            synchronize: false
        }),
        UserModule,
        ThrottlerModule.forRoot([{
                ttl: 60000,
                limit: 100
            }]),
    ],
    controllers: [AppController, UserController],
    providers: [AppService, UserService],
})
export class AppModule {}
