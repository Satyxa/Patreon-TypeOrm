import {Body, Controller, HttpCode, Post} from "@nestjs/common";
import {EmailService} from "./email.service";
import {Throttle} from "@nestjs/throttler";
import {emailClass, newPasswordPayloadClass} from "../../Types/classesTypes";

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
    @Post('password-recovery')
    @HttpCode(204)
    async recoveryCode(@Body() payload: emailClass) {
        await this.EmailService.recoveryCode(payload.email)
    }
    @Post('new-password')
    @HttpCode(204)
    async getNewPassword(@Body() payload: newPasswordPayloadClass) {
        await this.EmailService.getNewPassword(payload)
    }
}