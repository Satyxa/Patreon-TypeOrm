import {BadRequestException, HttpException} from "@nestjs/common";

export const CheckEntityId = {
    checkBlogId: async (dataSource, blogId, message) => {
        const blog = await this.dataSource
            .query(`SELECT * FROM "Blogs" where id = $1`,
                [blogId])
        if (!blog.length) {
            if(message === 'for blog') throw new HttpException('Not Found', 404)
            else if(message === 'for post') throw new BadRequestException(
                [{ field: 'blogId', message: 'Such blog doesnt exist'}])
        }
        else return blog
    },
    checkPostId: async (dataSource, postId) => {
        const post = await this.dataSource
            .query(`SELECT * FROM "Posts" where id = $1`,
                [postId])
        if (!post.length) throw new HttpException('Not Found', 404)
        else return post
    }
}