import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument} from "mongoose";

export type UserDocument = HydratedDocument<User>

@Schema()

class Sessions {
    @Prop()
    ip: string
    @Prop()
    title: string
    @Prop()
    deviceId: string
    @Prop()
    lastActiveDate: Date
}

@Schema()

class EmailConfirmation {
    @Prop()
    confirmationCode: string
    @Prop()
    expirationDate: Date
    @Prop()
    isConfirmed: boolean
}

@Schema()

class AccountData {
    @Prop({required: true})
    username: string
    @Prop({required: true})
    email: string
    @Prop({required: true})
    passwordHash: string
    @Prop()
    createdAt: Date
}

@Schema()

export class User {
    @Prop()
    id: string
    @Prop()
    AccountData: AccountData
    @Prop()
    EmailConfirmation: EmailConfirmation
    @Prop()
    sessions: Sessions[]
    @Prop()
    recoveryCode: string
}


export const UserSchema = SchemaFactory.createForClass(User)