import {Body, Controller, Post} from "@nestjs/common";
import {RegistrationService} from '../Services/registration.service'
import {createUserPayloadClass} from "../Types/classesTypes";
@Controller('auth/registration')
export class RegistrationController {
    constructor(private readonly RegistrationService: RegistrationService) {}
    @Post()
    async registration(@Body() createUserPayload: createUserPayloadClass) {
        console.log(1)
        await this.RegistrationService.registration(createUserPayload)
    }
}