import {Controller, Delete, Get, HttpCode} from '@nestjs/common';
import { AppService } from './app.service';
import { UserService } from "./Services/user.service";
import {DevicesService} from "./Services/devices.service";

@Controller()
export class AppController {
  constructor(
      private readonly appService: AppService,
      private readonly UserService: UserService,
      private readonly DevicesService: DevicesService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Delete('testing/all-data')
  @HttpCode(204)
  async deleteAll() {
    await this.UserService.deleteAll()
    await this.DevicesService.deleteAll()
  }

}
