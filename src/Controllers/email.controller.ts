import {Body, Controller, HttpCode, Post} from "@nestjs/common";
import {EmailService} from "../Services/email.service";

@Controller('auth')
export class EmailController {
    constructor(private readonly EmailService: EmailService) {}
    @Post('registration-confirmation')
    @HttpCode(204)
    async confirmEmail(@Body() payload) {
        await this.EmailService.confirmEmail(payload)
    }
    @Post('registration-email-resending')
    @HttpCode(204)
    async confirmationCodeResending(@Body() payload) {
        await this.EmailService.confirmationCodeResending(payload)
    }
}