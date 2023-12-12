import {commentsT, UserAccountDBType} from "../Types/types";

import * as uuid from 'uuid'

export const EntityWithReactions = {
    createComment: (id: string, content: string, user: UserAccountDBType) => {
        const comment: commentsT = {
            id: uuid.v4(),
            postId: id,
            content,
            createdAt: new Date().toISOString(),
            commentatorInfo: {
                userId: user.id,
                userLogin: user.AccountData.username
            },
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None'
            },
            reactions: []
        }
        const viewComment = {
            content: comment.content,
            commentatorInfo: comment.commentatorInfo,
            createdAt: comment.createdAt,
            id: comment.id,
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None'
            }
        }
        return {viewComment, comment}
    },

    getPostsInfo: async (dataSource) => {
        const reactions =
            await dataSource.query(`SELECT * FROM "Reactions"`)

        const newestLikes =
            await dataSource.query(`SELECT * FROM "NewestLikes"`)

        return {reactions, newestLikes}
    }
}