import {Body, Controller, HttpCode, Post} from "@nestjs/common";
import {RegistrationService} from '../Services/registration.service'
import {createUserPayloadClass} from "../Types/classesTypes";
@Controller('auth/registration')
export class RegistrationController {
    constructor(private readonly RegistrationService: RegistrationService) {}
    @Post()
    @HttpCode(204)
    async registration(@Body() createUserPayload: createUserPayloadClass) {
        console.log(1)
        await this.RegistrationService.registration(createUserPayload)
    }
}