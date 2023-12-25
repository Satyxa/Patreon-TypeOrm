import {BadRequestException, HttpException, UnauthorizedException} from "@nestjs/common";

export const CheckEntityId = {
    checkBlogId: async (dataSource, blogId, message) => {
        const blog = await dataSource
            .query(`SELECT * FROM "Blogs" where id = $1`,
                [blogId])
        if (!blog.length) {
            if(message === 'for post') throw new BadRequestException(
                [{ field: 'blogId', message: 'Such blog doesnt exist'}])
            else {
                console.log('NOT FOUND BLOG 404 ERROR')
                throw new HttpException('Not Found', 404)
            }
        }
        else return blog[0]
    },
    checkPostId: async (dataSource, postId) => {
        const post = await dataSource
            .query(`SELECT * FROM "Posts" where id = $1`,
                [postId])
        if (!post.length) {
            console.log('NOT FOUND POST 404 ERROR')
            throw new HttpException('Not Found', 404)
        }
        else return post[0]
    },
    checkUserId: async (dataSource, userId) => {
        const user = await dataSource
        .query(`SELECT * FROM "Users" where id = $1`, [userId])
        if (!user.length) throw new UnauthorizedException()
        else return user[0]
    },

    checkCommentId: async (dataSource, commentId) => {
        const comment = await dataSource
            .query(`SELECT * FROM "Comments" 
                where id = $1`, [commentId])
        if (!comment.length) throw new HttpException('Not Found', 404)
        else return comment[0]
    }
}