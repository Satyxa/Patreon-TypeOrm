import {HttpException, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Brackets, Repository} from "typeorm";
import {User} from "../Entities/User/UserEntity";
import {CheckEntityId} from "../Utils/checkEntityId";
import * as uuid from 'uuid'
import {createQuestionForPP, Question} from "../Entities/Quiz/QuestionEntity";
import {AnswerDB, Answers, viewAnswer} from "../Entities/Quiz/AnswersEntity";
import {createPairGame, PairGame, ViewPair} from "../Entities/Quiz/PairGameEntity";
import {Player} from "../Entities/Quiz/PlayerEntity";
import {gameUtils} from "../Utils/gameUtils";
import {GameQuestions} from "../Entities/Quiz/GameQuestionsEntity";

@Injectable()
export class GameService {
    constructor(@InjectRepository(User)
                private readonly UserRepository: Repository<User>,
                @InjectRepository(Answers)
                private readonly AnswersRepository: Repository<Answers>,
                @InjectRepository(PairGame)
                private readonly PairGameRepository: Repository<PairGame>,
                @InjectRepository(GameQuestions)
                private readonly GameQuestionRepository: Repository<GameQuestions>,
                @InjectRepository(Player)
                private readonly PlayerRepository: Repository<Player>,
                @InjectRepository(Question)
                private readonly QuestionRepository: Repository<Question>,
    ) {
    }

    // async deleteAll() {
    //     await this.QuestionRepository.delete({})
    // }

    async getActiveGame(userId) {
        const game = await gameUtils
            .getActiveGameForUser(this.PairGameRepository, userId)

        return await gameUtils
            .getViewPair(game.firstPlayerId, game.secondPlayerId,
                game.id, game, this.PlayerRepository,
                this.AnswersRepository, this.GameQuestionRepository)

    }


    async getGameById(id, userId) {
        await CheckEntityId.checkGameId(this.PairGameRepository, id)

        const game: PairGame | null =
            await this.PairGameRepository
            .createQueryBuilder('game')
            .where(new Brackets(qb =>
                qb.where("game.firstPlayerId = :userId", {userId})
                    .orWhere("game.secondPlayerId = :userId", {userId})))
            .andWhere("game.id = :id", {id})
            .getOne()
        if (!game) throw new HttpException('Forbidden', 403)

        return await gameUtils
            .getViewPair(game.firstPlayerId, game.secondPlayerId,
                game.id, game, this.PlayerRepository,
                this.AnswersRepository, this.GameQuestionRepository)

    }

    async setConnectToGame(userId) {
        const game: PairGame | null =
            await this.PairGameRepository
            .createQueryBuilder('game')
            .where("game.status = :status", {status: 'PendingSecondPlayer'})
            .getOne()

        if (game) {
            const playerProgress = await gameUtils
                .getPlayerProgress(this.PlayerRepository,
                this.AnswersRepository, userId, game.id, this.UserRepository)

            if(game.firstPlayerId === userId)
                throw new HttpException('Forbidden', 403)

            const startGameDate = new Date().toISOString()

            await this.PairGameRepository.update(
                {id: game.id},
                {
                    status: 'Active',
                    secondPlayerId: playerProgress!.player.id,
                    startGameDate
                })
            console.log(game.firstPlayerId, 11111111111)
            return await gameUtils
                .getViewPair(game.firstPlayerId, playerProgress!.player.id,
                    game.id, game, this.PlayerRepository,
                        this.AnswersRepository, this.GameQuestionRepository)
        } else {
            const gameId = uuid.v4()
            const pairCreatedDate = new Date().toISOString()

            const questions = await this.QuestionRepository
                .createQueryBuilder('q')
                .getMany()

            const questionsForGame = await gameUtils
                .getRandomQuestions(questions, gameId)

            await this.GameQuestionRepository
                .createQueryBuilder("gq")
                .insert()
                .values(questionsForGame)
                .execute()

            const newPair = new createPairGame(gameId, 'PendingSecondPlayer',
                pairCreatedDate, null, null,
                    userId, null)

            await this.PairGameRepository.save(newPair)

            return await gameUtils
                .getViewPair(userId, null, gameId, newPair,
                    this.PlayerRepository, this.AnswersRepository,
                        this.GameQuestionRepository, this.UserRepository)
        }
    }

    async sendAnswer(answer, userId) {
        const addedAt = new Date().toISOString()
        const game = await gameUtils
            .getActiveGameForUser(this.PairGameRepository, userId)

        const gameQuestions = await gameUtils
            .getQuestionsForGame(this.GameQuestionRepository, game.id)

        const userAnswers = await gameUtils
            .getAnswersForGame(this.AnswersRepository, userId, game.id)

        const currentQuestion = gameQuestions[userAnswers.length]

        const questionAnswers = currentQuestion.answers.split(',')

        const answerStatus = questionAnswers.includes(answer) ? 'Correct' : 'Incorrect'

        const newAnswerView = new viewAnswer(addedAt,
             currentQuestion.questionId, answerStatus)

        const newAnswerDB = new AnswerDB(uuid.v4(), userId, game.id,
            addedAt, currentQuestion.questionId, answerStatus)

        if(questionAnswers.includes(answer)) await this.AnswersRepository.save(newAnswerDB)
        else await this.AnswersRepository.save(newAnswerDB)
        return newAnswerView
    }


}