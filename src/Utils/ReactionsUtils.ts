export const ReactionsUtils = {
    async deleteReaction(dataSource, entityId, userId, forWho = '') {
        if(forWho === 'comment') await dataSource.query(`
        DELETE FROM "CommentsReactions" 
        where "commentId" = $1 and "userId" = $2
        `, [entityId, userId])

        else await dataSource.query(`
        DELETE FROM "Reactions" 
        where "postId" = $1 and "userId" = $2
        `, [entityId, userId])
    },

    async addReaction(dataSource, userId, entityId, userLikeStatus, forWho = '') {
        if(forWho === 'comment') await dataSource.query(`INSERT INTO "CommentsReactions" 
        ("userId", "commentId", "status", "createdAt") VALUES ($1, $2, $3, $4)`,
         [userId, entityId, userLikeStatus, new Date().toISOString()])

        else await dataSource.query(`INSERT INTO "Reactions" 
        ("userId", "postId", "status", "createdAt") VALUES ($1, $2, $3, $4)`,
         [userId, entityId, userLikeStatus, new Date().toISOString()])
    },

    async updateReactions(dataSource, entityId, userId, newStatus, forWho = '') {
        console.log(3)
        if(forWho === 'comment') await dataSource.query(`
        UPDATE "CommentsReactions" SET status = $1
        where "commentId" = $2 and "userId" = $3
        `, [newStatus, entityId, userId])

        else await dataSource.query(`
        UPDATE "Reactions" SET status = $1
        where "postId" = $2 and "userId" = $3
        `, [newStatus, entityId, userId])
    },

    async findReaction(dataSource, entityId, userId, forWho = '') {
        let reaction;

        if(forWho === 'comment') reaction = await dataSource.query(`
        SELECT * FROM "CommentsReactions"
        where "commentId" = $1 and "userId" = $2
        `, [entityId, userId])
        else reaction = await dataSource.query(`
        SELECT * FROM "Reactions"
        where "postId" = $1 and "userId" = $2
        `, [entityId, userId])

        return reaction.length ? reaction[0].status : null
    }
}

export const NewestLikesUtils = {
    async deleteNewLike(dataSource, postId, userId) {
        console.log(1)
        await dataSource.query(`
        DELETE FROM "NewestLikes" 
        where "postId" = $1 and "userId" = $2 
        `, [postId, userId])
    },

    async addNewLike(dataSource, postId, userId, login) {
        await dataSource.query(`INSERT INTO "NewestLikes" 
        ("postId", "userId", "addedAt", "login") VALUES ($1, $2, $3, $4)`,
        [postId, userId, new Date().toISOString(), login])
    }
}