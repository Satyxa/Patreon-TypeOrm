import {commentsT, UserAccountDBType, UserSQL} from "../Types/types";

import * as uuid from 'uuid'

export const EntityWithReactions = {
    createComment: (id: string, content: string, user: UserSQL, commentId: string, createdAt: string) => {
        return {
            id: commentId,
            content,
            createdAt,
            commentatorInfo: {
                userId: user.id,
                userLogin: user.username
            },
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None'
            },
        }
    },

    getPostsInfo: async (dataSource) => {
        const reactions =
            await dataSource.query(`SELECT * FROM "Reactions"`)

        const newestLikes =
            await dataSource.query(`SELECT * FROM "NewestLikes"`)

        return {reactions, newestLikes}
    },

    getCommentsInfo: async (dataSource) => {
        return await dataSource.query(`SELECT * FROM "CommentsReactions"`)
    }
}