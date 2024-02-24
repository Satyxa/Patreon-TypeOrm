import { HttpException, Injectable } from '@nestjs/common';
import {blogsT} from "../../Types/types";
import { blogBannedUsersPS, blogsPS, getValuesPS, postsPS } from '../../Utils/PaginationAndSort';
import * as uuid from 'uuid'
import {EntityUtils} from "../../Utils/Entity.utils";
import {getUserId} from "../../Utils/authentication";
import {InjectDataSource, InjectRepository} from "@nestjs/typeorm";
import { DataSource, In, Repository } from 'typeorm';
import {CheckEntityId} from "../../Utils/checkEntityId";
import {EntityWithReactions} from "../../Utils/EntityWithReactions";
import {Blog, createBlog} from "../../Entities/Blog/Blog.entity";
import {Post} from "../../Entities/Posts/Post.entity";
import {ExtendedLikesInfo} from "../../Entities/Posts/ExtendedLikesInfo.entity";
import {NewestLikes} from "../../Entities/Posts/NewestLikes.entity";
import {PostReactions} from "../../Entities/Posts/PostReactions.entity";
import { User } from '../../Entities/User/User.entity';
import { BlogBannedUsers, createBlogBannedUser } from '../../Entities/Blog/BlogBannedUsers.entity';
import { BlogBanInfo, createBlogBanInfo } from '../../Entities/Blog/BlogBanInfo.entity';
import { Comment } from '../../Entities/Comment/Comment.entity';
import { queryComments } from './blogger.controller';
import { CommentReactions } from '../../Entities/Comment/CommentReactions.entity';

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
              protected BlogBannedUsersRepository: Repository<BlogBannedUsers>,
              @InjectRepository(BlogBanInfo)
              protected BlogBanInfoRepository: Repository<BlogBanInfo>,
              @InjectRepository(Comment)
              protected CommentRepository: Repository<Comment>,
              @InjectRepository(CommentReactions)
              protected CommentReactionsRepository: Repository<CommentReactions>) {
  }

  deleteAllBlogs() {
    return this.BlogRepository.delete({})
  }

  async createBlog(name, description, websiteUrl, userId): Promise<blogsT> {

    const blogOwner = await CheckEntityId.checkUserId(this.UserRepository, userId)

    const id = uuid.v4()
    const createdAt = new Date().toISOString()

    const blogBanInfo = new createBlogBanInfo(false, null, id)

    await this.BlogBanInfoRepository.save(blogBanInfo)

    const blog: createBlog =
      new createBlog(id, name, description, websiteUrl, createdAt, blogOwner.AccountData, blogBanInfo)

    await this.BlogRepository.save(blog)

    const { AccountData, banInfo, ...viewBlog } = blog
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

  async banUser(userId, isBanned, banReason, blogId, ownerId) {
    const user = await CheckEntityId.checkUserId(this.UserRepository, userId)
    const banDate = new Date().toISOString()

    const blog = await CheckEntityId.checkBlogId(this.BlogRepository, blogId, 'for blog')

    if(blog.AccountData.userId !== ownerId)
      throw new HttpException('Forbidden', 403)


    if(isBanned) {
      const bannedUserForBlog =
        new createBlogBannedUser(userId, blogId, banReason,
          user.AccountData.login, banDate, isBanned)

      return await this.BlogBannedUsersRepository.save(bannedUserForBlog)
    } else {
      await this.BlogBannedUsersRepository.delete({userId, blogId})
    }


  }

  async getBannedUsersForBlog(blogId, payload, userId) {

    const blog = await CheckEntityId.checkBlogId(this.BlogRepository, blogId, 'for blog')

    if(blog.AccountData.userId !== userId)
      throw new HttpException('Forbidden', 403)

    const {pagesCount, pageNumber, pageSize, totalCount, bannedUsers} =
      await blogBannedUsersPS(this.BlogBannedUsersRepository, payload, blogId)

    return ({
      pagesCount, page: pageNumber, pageSize,
      totalCount, items: bannedUsers
    })
  }

  async getAllCommentsForBlogger(bloggerId, queryPayload: queryComments) {

    let {pageSize, pageNumber, sortBy, sortDirection} = getValuesPS(queryPayload)

    const offset = pageSize * pageNumber - pageSize

    const blogs = await this.BlogRepository
      .createQueryBuilder("b")
      .leftJoinAndSelect("b.AccountData", 'ac')
      .where("ac.userId = :bloggerId", {bloggerId})
      .getMany()

    const blogsIds = blogs.map(b => b.id)

    const posts = await this.PostRepository
      .find({where: {blog: {
        //@ts-ignore
        id: In(blogsIds)
          }},
        //@ts-ignore
      relations: {
        blog: true
      }})

    const postsInfo: any[] = []

    const postsIds = posts.map(p => {

      postsInfo.push({
        blogName: p.blogName,
        //@ts-ignore
        blogId: p.blog.id,
        title: p.title,
        id: p.id
      })

      return p.id;
    })

    const comments = await this.CommentRepository.find({
      //@ts-ignore
      relations: {
        CommentatorInfo: true,
        LikesInfo: true,
        post: true
      },
      where: {postId: In(postsIds)},
      order: {
        [sortBy]: sortDirection.toUpperCase()
      },
      take: pageSize,
      skip: +offset
    })

    const totalCount = await this.CommentRepository
      .count({ where: { postId: In(postsIds) } })

    const reactions = await EntityWithReactions
      .getCommentsInfo(this.CommentReactionsRepository)

    const pagesCount = Math.ceil(totalCount / pageSize)

    const viewComments = comments.map(comment => EntityUtils.createViewComment(comment, bloggerId, reactions, postsInfo))

    return ({pagesCount, page: +pageNumber, pageSize, totalCount, items: viewComments})
  }

}