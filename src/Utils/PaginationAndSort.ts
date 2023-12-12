import {FilterQuery, SortOrder} from "mongoose";
import {blogsT, commentsT, extendedLikesInfoT, newestLikesT, postT, UserAccountDBType, userT} from "../Types/types";

export const getValuesPS = (payload) => {
    let {pageNumber, pageSize, sortBy, searchLoginTerm, searchEmailTerm, sortDirection, searchNameTerm} = payload
    if(!searchLoginTerm && !searchEmailTerm){
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
        sortDirection: sortDirection ?? 'desc',
    }
}

export const usersPS = async (dataSource, payload) => {

    let {pageNumber, pageSize, sortBy, searchLoginTerm,
        searchEmailTerm, sortDirection} = getValuesPS(payload)

    const offset = pageSize * pageNumber - pageSize

    const count = await dataSource.query(`
    SELECT COUNT(*) 
    FROM "Users" 
    where (username ilike $1 OR email ilike $2)`,

    ['%' + searchLoginTerm + '%', '%' + searchEmailTerm + '%'])
    console.log(sortBy)
    const users = await dataSource.query(`
    SELECT "id", "createdAt", "username" as "login", "email" FROM "Users"
    where (username ilike $3 OR email ilike $4) 
    ORDER BY "${sortBy}" ${sortDirection}
    LIMIT $1 OFFSET $2`,

    [pageSize, offset, '%' + searchLoginTerm + '%', '%' + searchEmailTerm + '%'])

    const totalCount = +count[0].count
    const pagesCount = Math.ceil(totalCount / pageSize)

    return {users, pagesCount, pageNumber, pageSize, totalCount}
}

export const blogsPS = async (BlogModel, payload) => {
    const {pageNumber, pageSize, sortBy, searchNameTerm, sortDirection} = getValuesPS(payload)
    const filter: FilterQuery<blogsT> = {name: {$regex: searchNameTerm ?? '', $options: 'i'}}
    const totalCount = await BlogModel.countDocuments(filter)
    const pagesCount = Math.ceil(totalCount / pageSize)

    const blogs = await BlogModel
        .find(filter, {_id: 0, __v: 0})
        .sort({[sortBy!]: sortDirection})
        .skip(pageSize * pageNumber - pageSize)
        .limit(pageSize)
        .lean()
    return {blogs, pagesCount, pageNumber, pageSize, totalCount}
}

export const postsPS = async (dataSource, payload, filter = {}): Promise<any> => {
    const {pageNumber, pageSize, sortBy, sortDirection} = getValuesPS(payload)

    const offset = pageSize * pageNumber - pageSize

    const count = await dataSource.query(`
    SELECT COUNT(*)
    FROM "Posts"`)

    const result: postT[] = await dataSource.query(`
    SELECT "id", "title", "shortDescription", "content", 
    "blogId", "blogName","createdAt","likesCount",
    "dislikesCount", "myStatus", FROM "Posts"
    ORDER BY "${sortBy}" ${sortDirection}
    LIMIT $1 OFFSET $2`,
    [pageSize, offset])

    const posts = result.map((post) => {
        return {
            id: post.id,
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt,
            extendedLikesInfo: {
                likesCount: post.likesCount,
                dislikesCount: post.dislikesCount,
                myStatus: post.myStatus
            },
            newestLikes: []
        }
    })

    const totalCount = +count[0].count
    const pagesCount = Math.ceil(totalCount / pageSize)

    return {posts, pagesCount, pageNumber, pageSize, totalCount}
}

export const commentsPS = async (CommentModel, payload, filter) => {
    const {pageNumber, pageSize, sortBy, sortDirection} = getValuesPS(payload)
    const totalCount: number = await CommentModel.countDocuments(filter)
    const pagesCount = Math.ceil(totalCount / pageSize)

    const comments = await CommentModel
        .find(filter, {projection: {_id: 0, postId: 0}})
        .sort({[sortBy!]: sortDirection})
        .skip(pageSize * pageNumber - pageSize)
        .limit(pageSize)
        .lean()
    return {comments, pagesCount, pageNumber, pageSize, totalCount}
}

