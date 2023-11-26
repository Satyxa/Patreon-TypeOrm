import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument} from "mongoose";

export type TokenBlackListDocument = HydratedDocument<TokenBlackList>

@Schema()
export class TokenBlackList {
    @Prop()
    addedAt: Date
    @Prop()
    token: String
}



export const TokenBlackListSchema = SchemaFactory.createForClass(TokenBlackList)