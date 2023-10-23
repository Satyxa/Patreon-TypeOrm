import {HttpException, Injectable} from '@nestjs/common';
import {UserAccountDBType, userT, userViewT} from "../types";
import * as uuid from 'uuid'
import add from 'date-fns/add'
import bcrypt from 'bcrypt'
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "../Mongoose/UserSchema";
import {FilterQuery, Model} from "mongoose";
import {usersPS} from "../utils/PaginationAndSort";
import {EntityUtils} from "../utils/EntityUtils";
@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}
    deleteAllUsers(): any {
        return this.UserModel.deleteMany({})
    }

    async getAllUsers(payload) {

        const {users, pagesCount, pageNumber, pageSize, totalCount} = await usersPS(this.UserModel, payload)
        const viewUsers = users.map(user => {
            return {
                id: user.id,
                email: user.AccountData.email,
                login: user.AccountData.username,
                createdAt: user.AccountData.createdAt
            }
        })
        return ({
            pagesCount, page: pageNumber, pageSize,
            totalCount, items: viewUsers})
    }
    async getOneUser(id): Promise<User | null> {
        const user = await this.UserModel.findOne({id})
        if(!user) throw new HttpException('Not Found', 404)
        const projection = {
            _id:0,
            'AccountData._id': 0,
            'EmailConfirmation._id': 0,
            passwordHash: 0,
            recoveryCode: 0,
            __v: 0,
            sessions: 0 }
        return this.UserModel.findOne({id}, projection);
    }
    async createUser(login: string, email: string, password: string){
        // const passwordSalt = await bcrypt.genSalt(10)
        // const passwordHash = await bcrypt.hash(password, passwordSalt)
        const passwordHash = password
        const id = uuid.v4()
        const confirmationCode = uuid.v4()
        const createdAt = new Date().toISOString()
        const expirationDate = new Date().toISOString()
        const {UserDB, ViewUser} = EntityUtils.CreateUser(login, email, passwordHash, id, createdAt, expirationDate, confirmationCode)

        const createdUser = new this.UserModel(UserDB)
        await createdUser.save()

        return ViewUser
    }
    async deleteUser(id){
        const user = await this.UserModel.findOne({id})
        if(!user) throw new HttpException('Not Found', 404)
        await this.UserModel.findOneAndDelete({id})
    }
}
