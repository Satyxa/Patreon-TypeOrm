// import {InjectDataSource} from "@nestjs/typeorm";
// import {DataSource} from "typeorm";
// import {BadRequestException} from "@nestjs/common";
// import {EntityUtils} from "../Utils/EntityUtils";
//
// export class RegistrationService {
//     constructor(@InjectDataSource protected dataSource: DataSource) {}
//
//     async registration(payload) {
//         const {email, login, password} = payload
//         const userByLogin = await this.dataSource.query(`
//         SELECT * FROM "Users" where login = $1
//         `, [login])
//         const userByEmail = await this.dataSource.query(`
//         SELECT * FROM "Users" where email = $1
//         `, [email])
//         if (userByEmail || userByLogin) throw new BadRequestException([{
//             message: 'email or login already exist',
//             field: userByLogin ? 'login' : 'email'
//         }])
//         const {UserDB} = await EntityUtils.CreateUser(login, email, password)
//         const message = `<h1>Thank for your registration</h1>
//     <p>To finish registration please follow the link below:
//         <a href=https://somesite.com/confirm-email?code=${UserDB.EmailConfirmation.confirmationCode}'>complete registration</a>
//     </p>`
//         await this.UserModel.create({...UserDB})
//         await emailAdapter.sendEmail(UserDB.AccountData.email, 'Confirm your email', message)
//         return {UserDB}
//     }
// }