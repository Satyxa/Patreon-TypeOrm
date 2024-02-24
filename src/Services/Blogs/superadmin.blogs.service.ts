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
import { AccountData } from '../../Entities/User/AccountData.entity';
import { BlogBanInfo } from '../../Entities/Blog/BlogBanInfo.entity';
import { ObjectId } from 'typeorm/browser';

@Injectable()
export class SuperadminBlogsService {
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
              @InjectRepository(BlogBanInfo)
              protected BlogBanInfoRepository: Repository<BlogBanInfo>) {
  }

  deleteAllBlogs() {
    return this.BlogRepository.delete({})
  }

  async getAllBlogs(payload, userId: string | null = null) {
    const { pagesCount, pageNumber,
      pageSize, totalCount, blogs
    } = await blogsPS(this.BlogRepository, payload, userId, true)

    const blogsWithOwnerInfo = blogs.map((b: Blog) => {
      return {
        id: b.id,
        name: b.name,
        description: b.description,
        websiteUrl: b.websiteUrl,
        createdAt: b.createdAt,
        isMembership: b.isMembership,
        blogOwnerInfo: {
          userId: b.AccountData.userId,
          userLogin: b.AccountData.login
        },
        banInfo: {
          isBanned: b.banInfo.isBanned,
          banDate: b.banInfo.banDate
        }
      }
    })

    return ({pagesCount, page: +pageNumber, pageSize, totalCount, items: blogsWithOwnerInfo})
  }

  async banBlog(blogId, isBanned) {
    if(isBanned){
      await this.BlogBanInfoRepository
        .update({blogId},
        {isBanned, banDate: new Date().toISOString()})

      await this.PostRepository

        .update({ blog: {
          //@ts-ignore
            id: blogId
           }
          }, {isBanned})
    } else {
      await this.BlogBanInfoRepository
        .update({blogId},
          {isBanned, banDate: null})

      await this.PostRepository
        //@ts-ignore
        .update({ blog: {
            //@ts-ignore
            id: blogId
          }
        }, {isBanned})
    }
  }

}