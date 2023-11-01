import {Body, Controller, HttpCode, Post} from "@nestjs/common";
import {confirmationCodeClass, emailClass} from "../Types/classesTypes";
import {EmailService} from "../Services/email.service";

@Controller('auth')
export class EmailController {
    constructor(private readonly EmailService: EmailService) {}
    @Post('registration-confirmation')
    @HttpCode(204)
    async confirmEmail(@Body() code: confirmationCodeClass) {
        await this.EmailService.confirmEmail(code)
    }
    @Post('registration-email-resending')
    @HttpCode(204)
    async confirmationCodeResending(@Body() email: emailClass) {
        await this.EmailService.confirmationCodeResending(email)
    }
}