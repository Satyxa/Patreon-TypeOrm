import {Controller, Delete, Get, HttpCode} from '@nestjs/common';
import { AppService } from './app.service';
import { UserService } from "./Services/user.service";

@Controller()
export class AppController {
  constructor(
      private readonly appService: AppService,
      private readonly UserService: UserService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

}
