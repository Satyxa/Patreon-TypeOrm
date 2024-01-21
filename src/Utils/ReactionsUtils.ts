import {EntityUtils} from "./EntityUtils";
import {createPR} from "../Entities/Posts/PostReactionsEntity";
import * as uuid from "uuid";
import {createNL} from "../Entities/Posts/NewestLikesEntity";

export const ReactionsUtils = {
    async deleteReaction(Repository, entityId, userId) {
        await Repository.delete({entityId, userId})
    },

    async addReaction(Repository, userId, entityId, userLikeStatus) {
        const createdAt = new Date().toISOString()
        const id = uuid.v4()
        const reaction: createPR = new createPR(id, userId,
            entityId, userLikeStatus, createdAt)

        await Repository.save(reaction)
    },

    async updateReactions(Repository, entityId, userId, newStatus) {
        await Repository.update({entityId, userId}, {status: newStatus})
    },

    async findReaction(Repository, entityId, userId) {
        let reaction = await Repository.findOneBy({entityId, userId})
        return reaction ? reaction.status : null
    }
}

export const NewestLikesUtils = {
    async deleteNewLike(NewestLikesRepository, postId, userId) {
        await NewestLikesRepository.delete({postId, userId})
    },

    async addNewLike(NewestLikesRepository, postId, userId, login) {
        const id = uuid.v4()
        const addedAt = new Date().toISOString()
        const newestLikes = new createNL(id, addedAt, userId, login, postId)

        await NewestLikesRepository.save(newestLikes)
    }
}