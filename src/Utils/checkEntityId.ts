import {BadRequestException, HttpException, UnauthorizedException} from "@nestjs/common";
import {User} from "../Entities/User/UserEntity";
import {Brackets, Repository} from "typeorm";
import {Post} from "../Entities/Posts/PostEntity";
import {deleted} from "../Constants";
import {Blog} from "../Entities/BlogEntity";

export const CheckEntityId = {
    checkBlogId: async (BlogRepository, blogId, message) => {
        const blog: Blog | null = await BlogRepository
            .createQueryBuilder("b")
            .where("b.id = :blogId", {blogId})
            .andWhere("b.deleted = :deleted", {deleted})
            .getOne()
        if (!blog) {
            if(message === 'for post') throw new BadRequestException(
                [{ field: 'blogId', message: 'Such blog doesnt exist'}])
            else throw new HttpException('Not Found', 404)
        }
        else {
            const {deleted, ...viewBlog} = blog
            return viewBlog
        }
    },
    checkPostId: async (PostRepository: Repository<Post>, postId) => {
        const post = await PostRepository
            .createQueryBuilder("p")
            .leftJoinAndSelect("p.blog", "b")
            .where("p.id = :postId", {postId})
            .andWhere("p.deleted = :deleted",
                {deleted})
            .getOne()
        if (!post) throw new HttpException('Not Found', 404)

        else return post
    },
    checkUserId: async (UserRepository, userId) => {
        const user = await UserRepository
            .createQueryBuilder("u")
            .leftJoinAndSelect("u.AccountData", "ac")
            .leftJoinAndSelect("u.EmailConfirmation", "ec")
            .where("u.id = :userId", {userId})
            .andWhere("u.deleted = :deleted", {deleted})
            .getOne()
        if (!user) throw new HttpException('Not Found', 404)
        else return user
    },

    checkCommentId: async (CommentRepository, commentId) => {
        const comment = await CommentRepository
            .createQueryBuilder("c")
            .leftJoinAndSelect("c.CommentatorInfo", "ci")
            .leftJoinAndSelect("c.LikesInfo", "li")
            .where("c.id = :commentId", {commentId})
            .andWhere("c.deleted = :deleted", {deleted})
            .getOne()
        if (!comment) throw new HttpException('Not Found', 404)
        else return comment
    },
    checkGameId: async (PairGameRepository, id) => {
        const game = await PairGameRepository
            .createQueryBuilder("game")
            .leftJoinAndSelect("game.firstPlayerProgress", "fpp")
            .leftJoinAndSelect("game.secondPlayerProgress", "spp")
            .where("game.id = :id", {id})
            .getOne()
        if (!game) throw new HttpException('Not Found', 404)
        else return game
    }
}

export const findEntityBy = {
    async findUserByLoginAndEmail(UserRepository, findBy, findWhat = '',
                                  status = 404,
                                  forWhat = ''): Promise<User> {
        const User: User = await UserRepository
            .createQueryBuilder("u")
            .leftJoinAndSelect("u.AccountData", "ac")
            .leftJoinAndSelect("u.EmailConfirmation", "em")
            .where(`ac.${findWhat} = :findWhat`, {findWhat: findBy})
            .andWhere("u.deleted = :deleted", {deleted})
            .getOne()

        if (!User && status === 404) throw new HttpException('Not Found', 404)

        else if((User && status === 400 && forWhat === '') &&
                (findWhat === 'login' || findWhat === 'email'))
                    throw new BadRequestException(
                        [{message: 'email or login already exist',
                        field: findWhat === 'login' ? 'login' : 'email'}])

        else if((!User && status === 400 && forWhat === 'emailRes') &&
                (findWhat === 'login' || findWhat === 'email'))
            throw new BadRequestException(
                [{message: 'user with that email does not exist',
                            field: "email"}])

        else return User
    },

    async findUserByEmailOrLogin(UserRepository, loginOrEmail) {
        const foundUser: User | null = await UserRepository
            .createQueryBuilder("u")
            .leftJoinAndSelect("u.AccountData", "ac")
            .where("u.deleted = :deleted", {deleted})
            .andWhere(new Brackets(qb => {
                qb.where("ac.login = :loginOrEmail", {loginOrEmail})
                    .orWhere("ac.email = :loginOrEmail", {loginOrEmail})
            }))
            .getOne()
        if(!foundUser) throw new UnauthorizedException()
        return foundUser
    }
}