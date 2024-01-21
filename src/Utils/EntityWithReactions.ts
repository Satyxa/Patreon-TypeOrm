export const EntityWithReactions = {
    getPostsInfo: async (NewestLikesRepository,
                         ExtendedLikesInfoRepository,
                         PostReactionsRepository) => {
        const reactions =
            await PostReactionsRepository.createQueryBuilder("r").getMany()
        const extendedLikesInfo =
            await ExtendedLikesInfoRepository.createQueryBuilder("e").getMany()
        const newestLikes =
            await NewestLikesRepository.createQueryBuilder("n")
                .leftJoinAndSelect("n.postId", "p")
                .orderBy(`n.addedAt`, `DESC`)
                .getMany()

        return {reactions, newestLikes, extendedLikesInfo}
    },

    getCommentsInfo: async (CommentReactionsRepository) => {
        return await CommentReactionsRepository
            .createQueryBuilder("cr").getMany()
    }
}