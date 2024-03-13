import { HttpException, Injectable } from '@nestjs/common';
import { blogsT } from '../../Types/types';
import { blogBannedUsersPS, getValuesPS } from '../../Utils/PaginationAndSort';
import * as uuid from 'uuid';
import { EntityUtils } from '../../Utils/Entity.utils';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CheckEntityId } from '../../Utils/checkEntityId';
import { EntityWithReactions } from '../../Utils/EntityWithReactions';
import { Blog, createBlog } from '../../Entities/Blog/Blog.entity';
import { Post } from '../../Entities/Posts/Post.entity';
import { ExtendedLikesInfo } from '../../Entities/Posts/ExtendedLikesInfo.entity';
import { NewestLikes } from '../../Entities/Posts/NewestLikes.entity';
import { PostReactions } from '../../Entities/Posts/PostReactions.entity';
import { User } from '../../Entities/User/User.entity';
import { BlogBannedUsers, createBlogBannedUser } from '../../Entities/Blog/BlogBannedUsers.entity';
import { BlogBanInfo, createBlogBanInfo } from '../../Entities/Blog/BlogBanInfo.entity';
import { Comment } from '../../Entities/Comment/Comment.entity';
import { queryComments } from './blogger.controller';
import { CommentReactions } from '../../Entities/Comment/CommentReactions.entity';
import { imagesUtils } from '../../Utils/images.utils';
import { join, resolve } from 'path';
import sharp from 'sharp';
import { createImageInfo, createViewImageInfo, ImageInfo } from '../../Entities/Blog/Images/ImageInfo.entity';
import { createPostImageInfo, createPostViewImageInfo, PostImageInfo } from '../../Entities/Posts/ImageInfo.entity';

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
              protected CommentReactionsRepository: Repository<CommentReactions>,
              @InjectRepository(ImageInfo)
              protected BlogImageInfoRepository: Repository<ImageInfo>,
              @InjectRepository(PostImageInfo)
              protected PostImageInfoRepository: Repository<PostImageInfo>) {
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
      new createBlog(id, name, description, websiteUrl, createdAt,
        blogOwner.AccountData, blogBanInfo)

    await this.BlogRepository.save(blog)

    const { AccountData, banInfo, ...viewBlog } = blog

    const blogWithImages = {
      ...viewBlog,
      images: {
        wallpaper: null,
        main: []
      }
    }

    return blogWithImages
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

  async setMainImageForBlog(main, blogId, userId) {

    const blog = await CheckEntityId.checkBlogId(this.BlogRepository, blogId, 'for blog')

    if(blog.AccountData.userId !== userId)
      throw new HttpException('Forbidden', 403)

    imagesUtils.imageValidation(main, 156, 156)

    const uniqueFileName = uuid.v4()

    const viewPath =
      `https://patreon-typeorm.s3.eu-central-1.amazonaws.com/static/blogs/${blogId}/${uniqueFileName}`

    const mainInfo =
      new createImageInfo(blogId, viewPath,
        156, 156, main.size, `main`)

    await imagesUtils.saveFileToAWS(uniqueFileName, main.buffer,
      'blogs', blogId)

    await this.BlogImageInfoRepository.save(mainInfo)

    const wallpaperImage = await imagesUtils
      .getWallpaperAndMainsImagesForBlog(this.BlogImageInfoRepository, blogId, 'wallpaper')

    const mainImages = await imagesUtils
      .getWallpaperAndMainsImagesForBlog(this.BlogImageInfoRepository, blogId, 'main')

    return {
      main: mainImages,
      wallpaper: wallpaperImage
    }
  }

  async setWallpaperForBlog(wallpaper, blogId, userId) {

    const blog = await CheckEntityId.checkBlogId(this.BlogRepository, blogId, 'for blog')

    if(blog.AccountData.userId !== userId)
      throw new HttpException('Forbidden', 403)

    imagesUtils.imageValidation(wallpaper, 1028, 312)

    const uniqueFileName = uuid.v4()

    const viewPath =
      `https://patreon-typeorm.s3.eu-central-1.amazonaws.com/static/blogs/${blogId}/${uniqueFileName}`

    const wallpaperInfo =
      new createImageInfo(blogId, viewPath,
        312, 1028, wallpaper.size, 'wallpaper')

    await imagesUtils.saveFileToAWS(uniqueFileName, wallpaper.buffer,
      'blogs', blogId)

    await this.BlogImageInfoRepository.save(wallpaperInfo)

    const mainImages = await imagesUtils
      .getWallpaperAndMainsImagesForBlog(this.BlogImageInfoRepository, blogId, 'main')

    return {
      main: mainImages,
      wallpaper: new createViewImageInfo(viewPath,
        312, 1028, wallpaperInfo.fileSize),
    }

  }

  async setMainForPost(blogId, postId, main, userId){

    const blog = await CheckEntityId.checkBlogId(this.BlogRepository, blogId, 'for blog')

    await CheckEntityId.checkPostId(this.PostRepository, postId)

    if(blog.AccountData.userId !== userId)
      throw new HttpException('Forbidden', 403)

    imagesUtils.imageValidation(main, 940, 432)

    const viewPath = (imgType) =>
      `https://patreon-typeorm.s3.eu-central-1.amazonaws.com/static/posts/${postId}/${imgType}`

    await imagesUtils
      .saveFileToAWS('original', main.buffer, 'posts', postId)

    const original =
      new createPostImageInfo(postId, viewPath('original'),
        432, 940, main.size, 'original')

    const middle =
      await imagesUtils.getResizedImgAndImgInfo(main,
        'middle', 300, 180,
        viewPath('middle'), 'middle', postId)

    const small =
      await imagesUtils.getResizedImgAndImgInfo(main,
        'small', 149, 96,
        viewPath('small'), 'small', postId)

    await this.PostImageInfoRepository.save(original)
    await this.PostImageInfoRepository.save(middle)
    await this.PostImageInfoRepository.save(small)

    return {
      main: [
        new createPostViewImageInfo(viewPath('original'),
          432, 940, original.fileSize),
      new createPostViewImageInfo(viewPath('middle'),
        180, 300, middle.fileSize),
      new createPostViewImageInfo(viewPath('small'),
        96, 149, small.fileSize)
  ]
  }

  }

}