import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument} from "mongoose";

export type PostDocument = HydratedDocument<Post>

@Schema()
class CommentatorInfo {
    @Prop()
    userId: String
    @Prop()
    userLogin: String
}
@Schema()
class Comments {
    @Prop()
    id: String
    @Prop()
    content: String
    @Prop()
    createdAt: Date
    @Prop()
    postId: String
    @Prop()
    commentatorInfo: CommentatorInfo
}
@Schema()
class NewestLikes {
    @Prop()
    addedAt: Date
    @Prop()
    userId: string
    @Prop()
    login: string
}

@Schema()
class ExtendedLikesInfo {
    @Prop()
    likesCount: number
    @Prop()
    dislikesCount: number
    @Prop()
    myStatus: string
    @Prop()
    newestLikes: [NewestLikes]
}


@Schema()

class Reactions {
    @Prop()
    userId: string
    @Prop()
    status: string
    @Prop()
    createdAt: Date
}

@Schema()

export class Post {
    @Prop()
    id: string
    @Prop({required: true})
    title: string
    @Prop({required: true})
    shortDescription: string
    @Prop({required: true})
    content: string
    @Prop({required: true})
    blogId: string
    @Prop({required: true})
    blogName: string
    @Prop()
    createdAt: Date
    @Prop()
    comments: [Comments]
    @Prop()
    extendedLikesInfo: ExtendedLikesInfo
    @Prop()
    reactions: [Reactions]
}


export const PostSchema = SchemaFactory.createForClass(Post)