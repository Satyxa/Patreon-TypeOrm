import {ArgumentsHost, Catch, ExceptionFilter, HttpException} from "@nestjs/common";
import {ErrorsType} from "../Types/types";

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
        }

        return res.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: req.url
        })
    }
}