import {Brackets} from "typeorm";
import {deleted} from "../Constants";
import { Blog } from '../Entities/Blog/Blog.entity';

export const getValuesPS = (payload) => {
    let {pageNumber, pageSize, sortBy, searchLoginTerm,
        searchEmailTerm, sortDirection, bodySearchTerm,
        searchNameTerm, publishedStatus, sort, banStatus} = payload
    if (!searchLoginTerm && !searchEmailTerm) {
        searchEmailTerm = ''
        searchLoginTerm = ''
    }
    return {
        pageNumber: pageNumber ? +pageNumber : 1,
        pageSize: pageSize ? +pageSize : 10,
        sortBy: sortBy ?? 'createdAt',
        searchLoginTerm: !searchLoginTerm ? !searchEmailTerm ? '' : '$#@' : searchLoginTerm,
        searchEmailTerm: !searchEmailTerm ? !searchLoginTerm ? '' : '$#@' : searchEmailTerm,
        searchNameTerm: searchNameTerm ?? '',
        bodySearchTerm: bodySearchTerm ?? '',
        publishedStatus: publishedStatus ?? 'all',
        sortDirection: sortDirection ?? 'DESC' as 'ASC' | 'DESC' | undefined,
        sort: sort ?? [],
        banStatus: banStatus ?? 'all'
    }
}

export const questionsPS = async (QuestionRepository, payload) => {
    let {pageNumber, pageSize, sortBy, bodySearchTerm,
        publishedStatus, sortDirection} = getValuesPS(payload)

    const offset = pageSize * pageNumber - pageSize

    let query;

    if( publishedStatus === 'all')
        query =
          await QuestionRepository.createQueryBuilder('q')
            .where('q.body ilike :bodySearchTerm', {bodySearchTerm: `%${bodySearchTerm}%`})
    else
      query =
      await QuestionRepository.createQueryBuilder('q')
      .where('published = :ps', {ps: publishedStatus === 'published' ? true : false})
      .andWhere('q.body ilike :bodySearchTerm', {bodySearchTerm: `%${bodySearchTerm}%`})

    const totalCount = await query.getCount()

    const questions =
      await query
      .orderBy(`q.${sortBy}`, `${sortDirection.toUpperCase()}`)
      .limit(pageSize)
      .offset(offset)
      .getMany()

    const pagesCount = Math.ceil(totalCount / pageSize)
    return {questions, pagesCount, pageNumber, pageSize, totalCount}

}

export const pairsPS = async (payload, userId, query) => {

    let {pageNumber, pageSize,
        sortBy, sortDirection} = getValuesPS(payload)

    const offset = pageSize * pageNumber - pageSize

    if(sortBy === 'createdAt') sortBy = 'pairCreatedDate'

    const pairs = await query
        .where(new Brackets(qb => {
            qb.where('fpl.id = :userId', {userId})
              .orWhere('spl.id = :userId', {userId})
        }))
        .orderBy(`game.${sortBy}`, `${sortDirection.toUpperCase()}`)
        .addOrderBy(`game.pairCreatedDate`, `DESC`)
        .limit(pageSize)
        .offset(offset)
        .getMany()

    const totalCount = await query
      .where(new Brackets(qb => {
        qb.where('fpl.id = :userId', {userId})
          .orWhere('spl.id = :userId', {userId})
        }))
      .getCount()

    const pagesCount = Math.ceil(totalCount / pageSize)
    return {pairs, pagesCount, pageNumber, pageSize, totalCount}
}

export const usersPS = async (UserRepository, payload) => {
    let {pageNumber, pageSize, sortBy, searchLoginTerm,
         searchEmailTerm, sortDirection, banStatus} = getValuesPS(payload)

    const offset = pageSize * pageNumber - pageSize

    let query = await UserRepository
        .createQueryBuilder("u")
        .leftJoinAndSelect("u.AccountData", "ac")
        .leftJoinAndSelect("u.banInfo", 'ban')
        .select(["u.id", "ac.login", "ac.email", "ac.createdAt", "u.deleted", "ban"])
        .where(new Brackets(qb => {
            qb.where(`ac.email ilike :searchEmailTerm`, { searchEmailTerm:`%${searchEmailTerm}%` })
                .orWhere(`ac.login ilike :searchLoginTerm`, { searchLoginTerm:`%${searchLoginTerm}%` })
        }))

    if(banStatus === 'notBanned')
        query = query.andWhere('ban.isBanned = :banned', {banned: false})
     else if(banStatus === 'banned')
        query = query.andWhere('ban.isBanned = :banned', {banned: true})


    const totalCount = await query.getCount()

    const response = await query
        .orderBy(`ac.${sortBy}`, `${sortDirection.toUpperCase()}`)
        .limit(pageSize)
        .offset(offset)
        .getMany()

    const users = response.map(u => {
        return {
            id: u.id,
            login: u.AccountData.login,
            email: u.AccountData.email,
            createdAt: u.AccountData.createdAt,
            banInfo: {
                isBanned: u.banInfo.isBanned,
                banDate: u.banInfo.banDate,
                banReason: u.banInfo.banReason
            }
        }
    })

    const pagesCount = Math.ceil(totalCount / pageSize)
    return {users, pagesCount, pageNumber, pageSize, totalCount}
}

export const blogsPS = async (BlogRepository, payload, userId: string | null = null) => {
    const {pageNumber, pageSize, sortBy, searchNameTerm, sortDirection} = getValuesPS(payload)

    const offset = pageSize * pageNumber - pageSize

    const query = await BlogRepository
      .createQueryBuilder("b")
      .leftJoinAndSelect("b.AccountData", "ac")
      .where("b.name ilike :searchNameTerm", { searchNameTerm:`%${searchNameTerm}%` })

    let totalCount = await query;
    let blogs = await query;

    if(userId) {
        totalCount = await query
          .andWhere("ac.userId = :userId", {userId})
        blogs = await query
          .andWhere("ac.userId = :userId", {userId})
    }

    totalCount = await totalCount.getCount()

    blogs = await blogs
      .orderBy(`b.${sortBy}`, `${sortDirection.toUpperCase()}`)
      .limit(pageSize)
      .offset(offset)
      .getMany()

    const pagesCount = Math.ceil(totalCount / pageSize)

    const viewBlogs = blogs.map((b: Blog) => {
        const {AccountData, ...viewBlog} = b
        return viewBlog
    })

    return {viewBlogs, pagesCount, pageNumber, pageSize, totalCount, blogs}
}

export const postsPS = async (PostRepository, payload, filter = null): Promise<any> => {
    const {pageNumber, pageSize, sortBy, sortDirection} = getValuesPS(payload)

    const offset = pageSize * pageNumber - pageSize

    let query = await PostRepository
        .createQueryBuilder("p")
        .leftJoinAndSelect("p.blog", "b")

    if(filter) query.where(`b.id = :filter`, {filter})

    const posts = await query
        .orderBy(`p.${sortBy}`, `${sortDirection.toUpperCase()}`)
        .limit(pageSize)
        .offset(offset)
        .getMany()

    const totalCount = await query.getCount()
    const pagesCount = Math.ceil(totalCount / pageSize)

    return {posts, pagesCount, pageNumber, pageSize, totalCount}
}

export const commentsPS = async (CommentsRepository, payload, postId) => {
    const {pageNumber, pageSize, sortBy, sortDirection} = getValuesPS(payload)

    const offset = pageSize * pageNumber - pageSize

    const query = await CommentsRepository
        .createQueryBuilder("c")
        .leftJoinAndSelect("c.post", "p")
        .leftJoinAndSelect("c.CommentatorInfo", "ci")
        .leftJoinAndSelect("c.LikesInfo", "li")
        .where("p.id = :postId", {postId})
        .andWhere("c.deleted = :deleted", {deleted})

    const comments = await query
        .orderBy(`c.${sortBy}`, `${sortDirection.toUpperCase()}`)
        .limit(pageSize)
        .offset(offset)
        .getMany()

    const totalCount = await query.getCount()
    const pagesCount = Math.ceil(totalCount / pageSize)

    return {comments, pagesCount, pageNumber, pageSize, totalCount}
}

