import {ArgumentsHost, Catch, ExceptionFilter, HttpException, UnauthorizedException} from "@nestjs/common";
import {ErrorsType} from "../Types/types";
import { Response } from 'express'
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost): any {
        const ctx = host.switchToHttp()
        const res = ctx.getResponse()
        const req = ctx.getRequest()
        const status = exception.getStatus()
        if(status === 400) {
            const errors: ErrorsType[] = []
            const exceptionBody = exception.getResponse()
            exceptionBody.message.forEach((m) => errors.push(m))
            return res.status(status).send({errorsMessages: errors})
        } else if(status === 401) {
            return res.sendStatus(status)
        }
        console.log('ExceptionFilter')
        return res.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: req.url
        })

    }
}

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
    public catch(exception: UnauthorizedException, host: ArgumentsHost): Response {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        return response.status(401).json({ statusCode: 401 });
    }
}