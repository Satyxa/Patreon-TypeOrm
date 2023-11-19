import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import {InjectModel} from "@nestjs/mongoose";
import {Blog, BlogDocument} from "./Mongoose/BlogSchema";
import {Model} from "mongoose";
import {Injectable} from "@nestjs/common";

@ValidatorConstraint({ name: 'blogId', async: true })
@Injectable()
export class checkBlogId implements ValidatorConstraintInterface {
    constructor(@InjectModel(Blog.name) private BlogModel: Model<BlogDocument>) {}
    async validate(blogId: string) {
        const blog = await this.BlogModel.findOne({id: blogId}).lean()
        console.log(blog)
        return blog ? true : false
    }

    defaultMessage(args: ValidationArguments) {
        return 'BlogId incorrect';
    }
}