import {ArgumentsHost, Catch, ExceptionFilter, HttpException} from "@nestjs/common";
import {ErrorsType} from "../Types/types";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost): any {
        console.log('ExceptionFilter')
        const ctx = host.switchToHttp()
        const res = ctx.getResponse()
        const req = ctx.getRequest()
        const status = exception.getStatus()
        console.log(1)
        if(status === 400) {
            const errors: ErrorsType[] = []
            const exceptionBody = exception.getResponse()
            console.log(2)
            exceptionBody.message.forEach((m) => errors.push(m))
            console.log('ExceptionFilter')
            return res.status(status).send({errorsMessages: errors})
        }
        console.log(status)
        console.log('ExceptionFilter')
        return res.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: req.url
        })

    }
}