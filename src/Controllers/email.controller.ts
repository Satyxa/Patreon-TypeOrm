import {Body, Controller, HttpCode, Post} from "@nestjs/common";
import {EmailService} from "../Services/email.service";
import {Throttle} from "@nestjs/throttler";
import {emailClass, newPasswordPayloadClass} from "../Types/classesTypes";

@Controller('auth')
export class EmailController {
    constructor(private readonly EmailService: EmailService) {}
    @Throttle({ default: { limit: 5, ttl: 10000 } })
    @Post('registration-confirmation')
    @HttpCode(204)
    async confirmEmail(@Body() payload) {
        await this.EmailService.confirmEmail(payload)
    }
    @Throttle({ default: { limit: 5, ttl: 10000 } })
    @Post('registration-email-resending')
    @HttpCode(204)
    async confirmationCodeResending(@Body() payload) {
        await this.EmailService.confirmationCodeResending(payload)
    }
    @Throttle({ default: { limit: 5, ttl: 10000 } })
    @Post('password-recovery')
    @HttpCode(204)
    async recoveryCode(@Body() payload: emailClass) {
        await this.EmailService.recoveryCode(payload.email)
    }
    @Throttle({ default: { limit: 5, ttl: 10000 } })
    @Post('new-password')
    @HttpCode(204)
    async getNewPassword(@Body() payload: newPasswordPayloadClass) {
        await this.EmailService.getNewPassword(payload)
    }
}