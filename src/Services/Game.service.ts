import {HttpException, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Brackets, Repository} from "typeorm";
import {Answer} from "../Entities/Quiz/AnswerEntity";
import {createPairGame, PairGame} from "../Entities/Quiz/PairGame";
import {User} from "../Entities/User/UserEntity";
import {CheckEntityId} from "../Utils/checkEntityId";
import * as uuid from 'uuid'
import {Question} from "../Entities/Quiz/QuestionEntity";

@Injectable()
export class GameService {
    constructor(@InjectRepository(User)
                private readonly UserRepository: Repository<User>,
                @InjectRepository(Answer)
                private readonly AnswerRepository: Repository<Answer>,
                @InjectRepository(PairGame)
                private readonly PairGameRepository: Repository<PairGame>,
                @InjectRepository(Question)
                private readonly QuestionRepository: Repository<Question>) {}

    // async deleteAll() {
    //     await this.QuestionRepository.delete({})
    // }

    async getActiveGame(userId){
        const game: PairGame | null = await this.PairGameRepository
            .createQueryBuilder("game")
            .leftJoinAndSelect("game.firstPlayerProgress", 'fpp')
            .leftJoinAndSelect("game.secondPlayerProgress", 'spp')
            .where("fpp.id = :userId", {userId})
            .orWhere("spp.id = :userId", {userId})
            .getOne()
        if(!game) console.log('get Active game no game, USER ID: ' + userId)
        else return game
    }


    async getGameById(id, userId) {
        await CheckEntityId.checkGameId(this.PairGameRepository, id)

        const game = await this.PairGameRepository
            .createQueryBuilder("game")
            .leftJoinAndSelect("game.firstPlayerProgress", "fpp")
            .leftJoinAndSelect("game.secondPlayerProgress", "spp")
            .where(new Brackets(qb =>
                qb.where("fpp.id = :userId", {userId})
                  .orWhere("spp.id = :userId", {userId})))
            .andWhere("game.id = :id", {id})
            .getOne()
        if(!game) throw new HttpException('Forbidden', 403)
        else return game
    }

    async setConnectToGame(userId) {
        const id = uuid.v4()
        const pairCreatedDate = new Date().toISOString()

        const user: User = await CheckEntityId.checkUserId(this.UserRepository, userId)

        const game = await this.PairGameRepository
            .createQueryBuilder("game")
            .where("game.status = :status", {status: 'PendingSecondPlayer'})
            .getOne()

        if(game) {
            await this.PairGameRepository.update(
                {id: game.id},
                {status: 'Active',
                            secondPlayerProgress: user})
            return await CheckEntityId.checkGameId(this.PairGameRepository, game.id)
        } else {
            const questions = await this.QuestionRepository
                .createQueryBuilder("q")
                .select(['q.id', 'q.body', 'q.correctAnswers'])
                .getMany()
            const newPair = new createPairGame(id, pairCreatedDate,
                null, null,
                'PendingSecondPlayer',
            questions, user, null)
        }
    }
}