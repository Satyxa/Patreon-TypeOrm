import {Brackets} from "typeorm";
import {deleted} from "../Constants";

export const getValuesPS = (payload) => {
    let {pageNumber, pageSize, sortBy, searchLoginTerm,
        searchEmailTerm, sortDirection, bodySearchTerm,
        searchNameTerm, publishedStatus} = payload
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
            qb.where('fpl.userId = :userId', {userId})
              .orWhere('spl.userId = :userId', {userId})
        }))
        .orderBy(`q.${sortBy}`, `${sortDirection.toUpperCase()}`)
        .limit(pageSize)
        .offset(offset)
        .getMany()

    const totalCount = await query
      .where(new Brackets(qb => {
        qb.where('fpl.userId = :userId', {userId})
          .orWhere('spl.userId = :userId', {userId})
        }))
      .getCount()

    const pagesCount = Math.ceil(totalCount / pageSize)
    return {pairs, pagesCount, pageNumber, pageSize, totalCount}
}

export const usersPS = async (UserRepository, payload) => {
    let {pageNumber, pageSize, sortBy, searchLoginTerm,
         searchEmailTerm, sortDirection} = getValuesPS(payload)

    const offset = pageSize * pageNumber - pageSize

    const query = await UserRepository
        .createQueryBuilder("u")
        .leftJoinAndSelect("u.AccountData", "ac")
        .select(["u.id", "ac.login", "ac.email", "ac.createdAt", "u.deleted"])
        .where("u.deleted = :deleted", {deleted})
        .andWhere(new Brackets(qb => {
            qb.where(`ac.email ilike :searchEmailTerm`, { searchEmailTerm:`%${searchEmailTerm}%` })
                .orWhere(`ac.login ilike :searchLoginTerm`, { searchLoginTerm:`%${searchLoginTerm}%` })
        }))

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
        }
    })

    const pagesCount = Math.ceil(totalCount / pageSize)
    return {users, pagesCount, pageNumber, pageSize, totalCount}
}

export const blogsPS = async (BlogRepository, payload) => {
    const {pageNumber, pageSize, sortBy, searchNameTerm, sortDirection} = getValuesPS(payload)

    const offset = pageSize * pageNumber - pageSize

    const totalCount = await BlogRepository
        .createQueryBuilder("b")
        .where("b.name ilike :searchNameTerm", { searchNameTerm:`%${searchNameTerm}%` })
        .andWhere("b.deleted = :deleted", {deleted})
        .getCount()

    const pagesCount = Math.ceil(totalCount / pageSize)

    const blogs = await BlogRepository
        .createQueryBuilder("b")
        .select(["b.name", "b.id", "b.description", "b.websiteUrl",
            "b.isMembership", "b.createdAt"])
        .where("b.name ilike :searchNameTerm", { searchNameTerm:`%${searchNameTerm}%` })
        .andWhere("b.deleted = :deleted", {deleted})
        .orderBy(`b.${sortBy}`, `${sortDirection.toUpperCase()}`)
        .limit(pageSize)
        .offset(offset)
        .getMany()

    return {blogs, pagesCount, pageNumber, pageSize, totalCount}
}

export const postsPS = async (PostRepository, payload, filter = null): Promise<any> => {
    const {pageNumber, pageSize, sortBy, sortDirection} = getValuesPS(payload)

    const offset = pageSize * pageNumber - pageSize

    let query = await PostRepository
        .createQueryBuilder("p")
        .leftJoinAndSelect("p.blog", "b")
        .where("p.deleted = :deleted", {deleted})

    if(filter) query.andWhere(`b.id = :filter`, {filter})

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

