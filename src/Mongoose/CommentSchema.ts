import {HydratedDocument} from "mongoose";
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {commentsT} from "../Types/types";

export type CommentDocument = HydratedDocument<commentsT>

@Schema()

export class CommentatorInfo {
    @Prop()
    userId: string
    @Prop()
    userLogin: string
}

@Schema()

export class Reactions {
    @Prop()
    userId: string
    @Prop()
    status: string
    @Prop()
    createdAt: Date
}

@Schema()

export class LikesInfo {
    @Prop()
    likesCount: number
    @Prop()
    dislikesCount: number
    @Prop()
    myStatus: 'None' | 'Like' | 'Dislike'
}


@Schema()

export class Comment {
    @Prop()
    id: string
    @Prop({required: true})
    content: string
    @Prop({required: true})
    postId: string
    @Prop()
    createdAt: Date
    @Prop()
    commentatorInfo: CommentatorInfo
    @Prop()
    reactions: Reactions[]
    @Prop()
    likesInfo: LikesInfo
}

export const CommentSchema = SchemaFactory.createForClass(Comment)