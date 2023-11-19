import {FilterQuery, SortOrder} from "mongoose";
import {blogsT, commentsT, UserAccountDBType, userT} from "../Types/types";

export const getValuesPS = (payload) => {
    let {pageNumber, pageSize, sortBy, searchLoginTerm, searchEmailTerm, sortDirection, searchNameTerm} = payload

    return {
        pageNumber: pageNumber ? +pageNumber : 1,
        pageSize: pageSize ? +pageSize : 10,
        sortBy: sortBy  ?? 'createdAt',
        searchLoginTerm: searchLoginTerm as string,
        searchEmailTerm: searchEmailTerm as string,
        searchNameTerm: searchNameTerm as string,
        sortDirection: sortDirection ?? 'desc',
    }
}

export const usersPS = async(UserModel, payload) => {

    let {pageNumber, pageSize, sortBy, searchLoginTerm,
        searchEmailTerm, sortDirection} = getValuesPS(payload)
    if(sortBy && sortBy === 'login') {
        sortBy = 'username'
    }
    const filter: FilterQuery<userT> = {$or: [
            {'AccountData.username': {$regex: searchLoginTerm ?? '', $options: 'i'}},
            {'AccountData.email': {$regex: searchEmailTerm ?? '', $options: 'i'}}
        ]}

    const totalCount = await UserModel.countDocuments(filter)
    const pagesCount = Math.ceil(totalCount / pageSize)

    const projection = {
        _id:0,
        'AccountData._id': 0,
        'EmailConfirmation._id': 0,
        passwordHash: 0,
        recoveryCode: 0,
        __v: 0,
        sessions: 0 }

    const users = await UserModel
        .find(filter, projection)
        .sort({[`AccountData.${sortBy}`]: sortDirection})
        .skip(pageSize * pageNumber - pageSize)
        .limit(pageSize)
        .lean()

    return {users, pagesCount, pageNumber, pageSize, totalCount}
}

export const blogsPS = async(BlogModel, payload) => {
    const {pageNumber, pageSize, sortBy, searchNameTerm, sortDirection} = getValuesPS(payload)
    const filter: FilterQuery<blogsT> = {name: {$regex: searchNameTerm ?? '', $options: 'i'}}
    const totalCount = await BlogModel.countDocuments(filter)
    const pagesCount = Math.ceil(totalCount / pageSize)

    const blogs = await BlogModel
        .find(filter, { _id:0, __v: 0 })
        .sort({[sortBy!]: sortDirection})
        .skip(pageSize * pageNumber - pageSize)
        .limit(pageSize)
        .lean()
    return {blogs, pagesCount, pageNumber, pageSize, totalCount}
}

export const postsPS = async(PostModel, payload, filter = {}): Promise<any> => {
    const {pageNumber, pageSize, sortBy, sortDirection} = getValuesPS(payload)
    const totalCount: number = await PostModel.countDocuments(filter)
    const pagesCount = Math.ceil(totalCount / pageSize)

    const posts = await PostModel
        .find(filter, { projection: { _id:0, comments:0}})
        .sort({[sortBy!]: sortDirection})
        .skip(pageSize * pageNumber - pageSize)
        .limit(pageSize)
        .lean()
    return {posts, pagesCount, pageNumber, pageSize, totalCount}
}

export const commentsPS = async(CommentModel, payload, filter) => {
    const {pageNumber, pageSize, sortBy, sortDirection} = getValuesPS(payload)
    const totalCount: number = await CommentModel.countDocuments(filter)
    const pagesCount = Math.ceil(totalCount / pageSize)

    const comments = await CommentModel
        .find(filter, { projection: {_id:0, postId: 0} })
        .sort({[sortBy!]: sortDirection})
        .skip(pageSize * pageNumber - pageSize)
        .limit(pageSize)
        .lean()
    return {comments, pagesCount, pageNumber, pageSize, totalCount}
}

