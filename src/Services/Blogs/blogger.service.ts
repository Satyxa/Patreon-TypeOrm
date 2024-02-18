import { HttpException, Injectable } from '@nestjs/common';
import {blogsT} from "../../Types/types";
import {blogsPS, postsPS} from "../../Utils/PaginationAndSort";
import * as uuid from 'uuid'
import {EntityUtils} from "../../Utils/Entity.utils";
import {getUserId} from "../../Utils/authentication";
import {InjectDataSource, InjectRepository} from "@nestjs/typeorm";
import {DataSource, Repository} from "typeorm";
import {CheckEntityId} from "../../Utils/checkEntityId";
import {EntityWithReactions} from "../../Utils/EntityWithReactions";
import {Blog, createBlog} from "../../Entities/Blog/Blog.entity";
import {Post} from "../../Entities/Posts/Post.entity";
import {ExtendedLikesInfo} from "../../Entities/Posts/ExtendedLikesInfo.entity";
import {NewestLikes} from "../../Entities/Posts/NewestLikes.entity";
import {PostReactions} from "../../Entities/Posts/PostReactions.entity";
import { User } from '../../Entities/User/User.entity';
import { BlogBannedUsers, createBlogBannedUser } from '../../Entities/Blog/BlogBannedUsers.entity';

@Injectable()
export class BloggerService {
  constructor(@InjectRepository(Blog)
              protected BlogRepository: Repository<Blog>,
              @InjectRepository(Post)
              protected PostRepository: Repository<Post>,
              @InjectRepository(ExtendedLikesInfo)
              protected ExtendedLikesInfoRepository: Repository<ExtendedLikesInfo>,
              @InjectRepository(NewestLikes)
              protected NewestLikesRepository: Repository<NewestLikes>,
              @InjectRepository(PostReactions)
              protected PostReactionsRepository: Repository<PostReactions>,
              @InjectRepository(User)
              protected UserRepository: Repository<User>,
              @InjectRepository(BlogBannedUsers)
              protected BlogBannedUsersRepository: Repository<BlogBannedUsers>) {
  }

  deleteAllBlogs() {
    return this.BlogRepository.delete({})
  }

  async createBlog(name, description, websiteUrl, userId): Promise<blogsT> {

    const blogOwner = await CheckEntityId.checkUserId(this.UserRepository, userId)

    const id = uuid.v4()
    const createdAt = new Date().toISOString()

    const blog: createBlog =
      new createBlog(id, name, description, websiteUrl, createdAt, blogOwner.AccountData)

    await this.BlogRepository.save(blog)

    const { AccountData, ...viewBlog } = blog
    return viewBlog
  }

  async deleteBlog(id, userId) {
    const blog = await CheckEntityId
      .checkBlogId(this.BlogRepository, id, 'for blog')

    if(blog.AccountData.userId !== userId) throw new HttpException('Forbidden', 403)

    await this.BlogRepository.delete({id})
  }

  async updateBlog(id, updateBlogPayload, userId) {
    const { name, description, websiteUrl } = updateBlogPayload
    const blog = await CheckEntityId
      .checkBlogId(this.BlogRepository, id, 'for blog')

    if(blog.AccountData.userId !== userId) throw new HttpException('Forbidden', 403)

    await this.BlogRepository
      .update({ id }, { name, description, websiteUrl })
  }

  async banUser(userId, isBanned, banReason, blogId) {
    const user = await CheckEntityId.checkUserId(this.UserRepository, userId)
    const banDate = new Date().toISOString()

    const bannedUserForBlog =
      new createBlogBannedUser(userId, blogId, banReason,
        user.AccountData.login, banDate, isBanned)

    await this.BlogBannedUsersRepository.save(bannedUserForBlog)


  }

  async getBannedUsersForBlog(id) {
    const result =
      await this.BlogBannedUsersRepository
        .createQueryBuilder("bbu")
        .where('bbu.blogId = :id', {id})
        .getMany()

    console.log(result);

    return result
  }

}