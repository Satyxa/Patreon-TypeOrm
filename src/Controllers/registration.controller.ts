import {Body, Controller, HttpCode, Post} from "@nestjs/common";
import {RegistrationService} from '../Services/registration.service'
import {createUserPayloadClass} from "../Types/classesTypes";
import {Throttle} from "@nestjs/throttler";
@Controller('auth/registration')
export class RegistrationController {
    constructor(private readonly RegistrationService: RegistrationService) {}
    @Throttle({ default: { limit: 5, ttl: 10000 } })
    @Post()
    @HttpCode(204)
    async registration(@Body() createUserPayload: createUserPayloadClass) {
        console.log(1)
        await this.RegistrationService.registration(createUserPayload)
    }
}