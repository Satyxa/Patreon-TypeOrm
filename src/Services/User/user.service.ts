import {BadRequestException, HttpException, Injectable} from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import {InjectDataSource, InjectRepository} from "@nestjs/typeorm";
import * as uuid from 'uuid'
import {EntityUtils} from "../../Utils/Entity.utils";
import {emailAdapter} from "../../Utils/email-adapter";
import {usersPS} from "../../Utils/PaginationAndSort";
import {UserSQL} from "../../Types/types";
import {User} from "../../Entities/User/User.entity";
import {AccountData} from "../../Entities/User/AccountData.entity";
import {EmailConfirmation} from "../../Entities/User/EmailConfirmation.entity";
import {CheckEntityId, findEntityBy} from "../../Utils/checkEntityId";
import {EMAIL_CONF_MESSAGE} from "../../Constants";
import { Player } from '../../Entities/Quiz/Player.entity';
import { createViewStatistic, Statistic } from '../../Entities/User/Statistic.entity';
import { TokenBlackList } from '../../Entities/Token/TokenBlackList.entity';
import { Post } from '../../Entities/Posts/Post.entity';
import { PostReactions } from '../../Entities/Posts/PostReactions.entity';
import { CommentReactions } from '../../Entities/Comment/CommentReactions.entity';
import { Comment } from '../../Entities/Comment/Comment.entity';
import { ExtendedLikesInfo } from '../../Entities/Posts/ExtendedLikesInfo.entity';
import { LikesInfo } from '../../Entities/Comment/LikesInfo.entity';
import { BanInfo } from '../../Entities/User/BanInfo.entity';
import { NewestLikes } from '../../Entities/Posts/NewestLikes.entity';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User)
                private readonly UserRepository: Repository<User>,
                @InjectRepository(AccountData)
                private readonly AccountDataRepository: Repository<AccountData>,
                @InjectRepository(EmailConfirmation)
                private readonly EmailConfirmationRepository: Repository<EmailConfirmation>,
                @InjectRepository(Player)
                private readonly PlayerRepository: Repository<Player>,
                @InjectDataSource() private readonly dataSource: DataSource,
                @InjectRepository(Statistic)
                private readonly StatisticRepository: Repository<Statistic>,
                @InjectRepository(TokenBlackList)
                private readonly TokenBlackListRep: Repository<TokenBlackList>,
                @InjectRepository(ExtendedLikesInfo)
                private readonly ExtendedLikesInfoRepository: Repository<ExtendedLikesInfo>,
                @InjectRepository(PostReactions)
                private readonly PostReactionsRepository: Repository<PostReactions>,
                @InjectRepository(LikesInfo)
                private readonly LikesInfoRepository: Repository<LikesInfo>,
                @InjectRepository(CommentReactions)
                private readonly CommentReactionsRepository: Repository<CommentReactions>,
                @InjectRepository(BanInfo)
                private readonly BanInfoRepository: Repository<BanInfo>,
                @InjectRepository(NewestLikes)
                private readonly NewestLikesRepository: Repository<NewestLikes>,) {
    }

    async deleteAll() {
        await this.UserRepository.delete({})
    }

    async getAllUsers(payload) {
        const {users, pagesCount, pageNumber, pageSize, totalCount} =
          await usersPS(this.UserRepository, payload)
        return ({
            pagesCount, page: pageNumber, pageSize,
            totalCount, items: users})
    }

    async createUser(payload) {

        const {login, email, password} = payload
        await findEntityBy
            .findUserByLoginAndEmail(this.UserRepository, login, 'login', 400)
        await findEntityBy
            .findUserByLoginAndEmail(this.UserRepository, email, 'email', 400)

        const {User, AccountData, EmailConfirmation,
            ViewUser, BanInfo} =
          await EntityUtils.CreateUser(login, email, password)

        await this.AccountDataRepository.save(AccountData)
        await this.EmailConfirmationRepository.save(EmailConfirmation)
        await this.BanInfoRepository.save(BanInfo)
        await this.UserRepository.save(User)

        const player = {
            id: User.id,
            login: AccountData.login
        }

        await this.PlayerRepository.save(player)

        await this.StatisticRepository.save(EntityUtils.createNewStatistic(User.id, player))

        // await emailAdapter.sendEmail(email, 'Confirm your email',
        //     EMAIL_CONF_MESSAGE(EmailConfirmation.confirmationCode))

        return ViewUser
    }

    async deleteUser(id) {
        await CheckEntityId.checkUserId(this.UserRepository, id)
        return this.UserRepository.delete({id})
    }

    async banUser(id, isBanned, banReason) {
        await CheckEntityId.checkUserId(this.UserRepository, id)
        let banDate: string | null = new Date().toISOString()

        const userLikedPostsId = await EntityUtils
          .getAllUserReactionsId(id, this.PostReactionsRepository, 'Like')

        const userDislikedPostsId = await EntityUtils
          .getAllUserReactionsId(id, this.PostReactionsRepository, 'Dislike')

        const userLikedCommentsId = await EntityUtils
          .getAllUserReactionsId(id, this.CommentReactionsRepository, 'Like')

        const userDislikedCommentsId = await EntityUtils
          .getAllUserReactionsId(id, this.CommentReactionsRepository, 'Dislike')

        if(!isBanned) {
            banReason = null
            banDate = null

            await this.NewestLikesRepository.update({userId: id}, {banned: false})

            await EntityUtils
              .changePostsReactions(this.ExtendedLikesInfoRepository,
                userLikedPostsId, {likesCount: () => 'likesCount + 1'})

            await EntityUtils
              .changePostsReactions(this.ExtendedLikesInfoRepository,
                userDislikedPostsId, {dislikesCount: () => 'dislikesCount + 1'})

            await EntityUtils
              .changeCommentsReactions(this.LikesInfoRepository,
                userLikedCommentsId, {likesCount: () => 'likesCount + 1'})

            await EntityUtils
              .changeCommentsReactions(this.LikesInfoRepository,
                userDislikedCommentsId, {dislikesCount: () => 'dislikesCount + 1'})
        } else if(isBanned) {

            await this.NewestLikesRepository.update({userId: id}, {banned: true})

            await EntityUtils
              .changePostsReactions(this.ExtendedLikesInfoRepository,
                userLikedPostsId, {likesCount: () => 'likesCount - 1'})

            await EntityUtils
              .changePostsReactions(this.ExtendedLikesInfoRepository,
                userDislikedPostsId, {dislikesCount: () => 'dislikesCount - 1'})

            // need to remove all likes and dislikes for comments

            await EntityUtils
              .changeCommentsReactions(this.LikesInfoRepository,
                userLikedCommentsId, {likesCount: () => 'likesCount - 1'})

            await EntityUtils
              .changeCommentsReactions(this.LikesInfoRepository,
                userDislikedCommentsId, {dislikesCount: () => 'dislikesCount - 1'})
        }

        return await this.BanInfoRepository
          .update({userId: id},
            { isBanned, banReason, banDate })

        // need to remove all likes and dislikes for posts

    }
}
