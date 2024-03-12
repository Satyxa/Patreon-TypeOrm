import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {BadRequestException, ValidationPipe} from "@nestjs/common";
import {HttpExceptionFilter} from "./Middleware/exception.filter";
import {ErrorsType} from "./Types/types";
import cookieParser from 'cookie-parser';
import {useContainer} from "class-validator";
import { CreateBucketCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

async function Server() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  app.use(cookieParser());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(new ValidationPipe({exceptionFactory: (errors) => {
    const errorsForRes: ErrorsType[] = []
      errors.forEach((e) => {
        const zeroKey = Object.keys(e.constraints!)[0]
        errorsForRes.push({
          field: e.property,
          message: e.constraints![zeroKey]
        })
      })
      throw new BadRequestException(errorsForRes)
  }}))
  app.useGlobalFilters(new HttpExceptionFilter())

  await app.listen(1668);
}
Server();
