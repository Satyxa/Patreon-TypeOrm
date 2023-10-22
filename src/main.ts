import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {Controller, Delete} from "@nestjs/common";
import { UserService } from "./Services/user.service";

@Controller('/delete-all')
class deleteAll {
  constructor(private readonly UserService: UserService) {}
  @Delete()
  async deleteAll() {
    return await this.UserService.deleteAllUsers();
  }
}

async function Server() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  await app.listen(1666);
}
Server();
