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
import { createViewImageInfo, ImageInfo } from '../../Entities/Blog/Images/ImageInfo.entity';
import { join } from 'path';

@Injectable()
export class BlogService {
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
                @InjectRepository(ImageInfo)
                protected ImageInfoRepository: Repository<ImageInfo>) {
    }

    deleteAllBlogs() {
        return this.BlogRepository.delete({})
    }

    async getAllBlogs(payload, userId: string | null = null) {
        const {
            viewBlogs, pagesCount, pageNumber,
            pageSize, totalCount
        } = await blogsPS(this.BlogRepository, payload, userId, false, this.ImageInfoRepository)
        return ({pagesCount, page: +pageNumber, pageSize, totalCount, items: viewBlogs})
    }

    async getOneBlog(id) {
        const {AccountData, ...viewBlog} = await CheckEntityId
          .checkBlogId(this.BlogRepository, id, 'for blog')

        let wallpaper: createViewImageInfo | null = null;
        let main: createViewImageInfo[] = [];
        //@ts-ignore
        viewBlog.images.forEach((i: ImageInfo) => {
            if(i.type === 'wallpaper') wallpaper =
              new createViewImageInfo(i.url, i.height, i.width, i.fileSize)
            else if(i.type === 'main') {
                main.push(
                  new createViewImageInfo(i.url.split('\\').join('/'), i.height, i.width, i.fileSize));
            }

        })
//@ts-ignore
        viewBlog.images = { wallpaper, main }

        return viewBlog
    }

    async getPostsForBlog(id, payload, headers, path = 'all') {
        const userId = await getUserId(headers)
        const blog = await CheckEntityId
          .checkBlogId(this.BlogRepository, id, 'for blog')

        if(path === 'blogger' && blog.AccountData.userId !== userId)
            throw new HttpException('Forbidden', 403)

        const {posts, pagesCount, pageNumber, pageSize, totalCount} =
          await postsPS(this.PostRepository, payload, id)

        const {reactions, newestLikes, extendedLikesInfo} =
          await EntityWithReactions
            .getPostsInfo(
              this.NewestLikesRepository,
              this.ExtendedLikesInfoRepository,
              this.PostReactionsRepository)
        const items = posts.map(post =>
          EntityUtils.GetPost(post, newestLikes, reactions, extendedLikesInfo, userId))

        return ({pagesCount, page: +pageNumber, pageSize, totalCount, items})
    }
}