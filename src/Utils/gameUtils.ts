import * as uuid from 'uuid'
import {PairGame, ViewPair} from "../Entities/Quiz/PairGameEntity";
import {createPlayerProgress} from "../Entities/Quiz/PlayerEntity";
import {createQuestionForPP, Question} from "../Entities/Quiz/QuestionEntity";
import {createGameQuestion, GameQuestions} from "../Entities/Quiz/GameQuestionsEntity";
import {Brackets, Repository} from "typeorm";
import {BadRequestException, HttpException} from "@nestjs/common";
import {EntityUtils} from "./EntityUtils";
import {CheckEntityId} from "./checkEntityId";
import {User} from "../Entities/User/UserEntity";

export const gameUtils = {
    async findPlayer(PlayerRepository, userId, gameId) {
        console.log(userId)
        return await PlayerRepository
            .createQueryBuilder("p")
            .where("p.userId = :userId",
                {userId})
            .andWhere("p.gameId = :gameId",
                {gameId})
            .getOne()
    },
    async findPlayerAnswers(AnswersRepository, userId, gameId) {
        return await AnswersRepository
            .createQueryBuilder("a")
            .where("a.userId = :userId", {userId})
            .andWhere("a.gameId = :gameId", {gameId})
            .getMany()
    },

    async getPlayerProgress(PlayerRepository, AnswersRepository, playerId,
                            gameId, UserRepository: Repository<User> | null = null) {
        let player = await gameUtils
            .findPlayer(PlayerRepository, playerId, gameId)

        if(UserRepository) {
            const user = await CheckEntityId.checkUserId(UserRepository, playerId)
            return {
                score: 0,
                player: {
                    login: user.AccountData.login,
                    id: playerId
                },
                answers: []
            }
        }

        const answers = await gameUtils
            .findPlayerAnswers(AnswersRepository, playerId, gameId)

        return createPlayerProgress(player, answers)
    },

    async getQuestionsForGame(GameQuestionRepository, gameId): Promise<GameQuestions[]> {
        return  await GameQuestionRepository
            .createQueryBuilder("gq")
            .where("gq.gameId = :gameId", {gameId})
            .getMany()
    },

    async getAnswersForGame(AnswersRepository, userId, gameId) {
        return await AnswersRepository
            .createQueryBuilder('a')
            .where('a.userId = :userId', {userId})
            .andWhere('a.gameId = :gameId', {gameId})
            .getMany()
    },
    async getViewPair(fpId, spId, gameId, game,
                      PlayerRepository, AnswersRepository, GameQuestionRepository,
                      UserRepository: Repository<User> | null = null) {
        let firstPlayerProgress;

        if (!UserRepository) firstPlayerProgress = await this
            .getPlayerProgress(PlayerRepository, AnswersRepository,
                fpId, gameId)
        else {
            const user: User = await CheckEntityId.checkUserId(UserRepository, fpId)
            firstPlayerProgress = {
                score: 0,
                answers: [],
                player: {
                    id: fpId,
                    login: user.AccountData.login
                }
            }
        }

            const secondPlayerProgress = await this
                .getPlayerProgress(PlayerRepository, AnswersRepository,
                    spId, gameId)

            const questions = await gameUtils
                .getQuestionsForGame(GameQuestionRepository, gameId)
                const questionsForGame = questions.map(q => {
                return {
                    id: q.questionId,
                    body: q.body
                }
             })

            return new ViewPair(gameId, game.status, game.pairCreatedDate,
                game.startGameDate, game.finishGameDate, firstPlayerProgress,
                secondPlayerProgress, questionsForGame)

    },

    async getRandomQuestions(questions: Question[], gameId: string) {
        if (questions.length <= 5) return questions
        let numbers: number[] = []

        while ([...new Set(numbers)].length <= 5) {
            numbers.push(Math.floor(Math.random() *
                (questions.length + 1)))
        }
        const viewQuestions: createGameQuestion[] = []

        questions.map((q, i) => {
            if (numbers.includes(i))
                viewQuestions.push(new createGameQuestion(uuid.v4(),
                    q.id, gameId, q.body, q.correctAnswers))
        })
        return viewQuestions
    },

    async getActiveGameForUser(PairGameRepository, userId): Promise<PairGame> {
        const game = await PairGameRepository
            .createQueryBuilder('game')
            .where(new Brackets(qb =>
                qb.where("game.firstPlayerId = :userId", {userId})
                    .orWhere("game.secondPlayerId = :userId", {userId})))
            .andWhere(new Brackets(qb =>
                qb.where("game.status = :status",
                    {status: 'Active'})
                    .orWhere("game.status = :status",
                        {status: 'PendingSecondPlayer'})))
            .getOne()
        if (!game) throw new HttpException('not found', 404)
        else return game
    }
}
