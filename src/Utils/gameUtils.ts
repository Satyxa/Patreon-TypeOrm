import * as uuid from 'uuid'
import { Brackets } from 'typeorm';
import { createViewPairGame, PairGame } from '../Entities/Quiz/PairGameEntity';
import { HttpException } from '@nestjs/common';
import { Question } from '../Entities/Quiz/QuestionEntity';
import { createDBGameQuestion, createViewGameQuestion } from '../Entities/Quiz/GameQuestionsEntity';
import { createUserAnswer, createViewUserAnswer, UserAnswers } from '../Entities/Quiz/UserAnswersEntity';
import { createViewPlayerProgress } from '../Entities/Quiz/PlayerProgressEntity';
import { EntityUtils } from './EntityUtils';

export const gameUtils = {

    async isUserAlreadyHaveActiveGame(query, userId) {
      const game = await query
        .where('game.status = :status', {status: 'Active'})
        .andWhere(new Brackets(qb => {
          qb.where('fpp.player.id = :userId', {userId})
            .orWhere('spp.player.id = :userId', {userId})
        }))
        .getOne()
      if(game) throw new HttpException('Forbidden', 403)

      else return game
    },

    async getGameQuery(PairGameRepo) {
      return await PairGameRepo
        .createQueryBuilder('game')
        .leftJoinAndSelect('game.firstPlayerProgress', 'fpp')
        .leftJoinAndSelect('fpp.player', 'fpl')
        .leftJoinAndSelect('game.secondPlayerProgress', 'spp')
        .leftJoinAndSelect('spp.player', 'spl')
    },
  async getUserAnswers(UserAnswersRepository, ppId): Promise<createViewUserAnswer[]> {
    const userAnswers: UserAnswers[] = await UserAnswersRepository
      .createQueryBuilder('ua')
      .where('ua.ppId = :ppId',
        {ppId})
      .orderBy('ua.addedAt', 'ASC')
      .getMany()

    return userAnswers.map(ua =>
      new createViewUserAnswer(ua.questionId, ua.answerStatus, ua.addedAt))
  },

  async findCurrentGame(PairGameRepository, userId) {
    return await PairGameRepository
        .createQueryBuilder('game')
        .leftJoinAndSelect('game.firstPlayerProgress', 'fpp')
        .leftJoinAndSelect('fpp.player', 'fp')
        .leftJoinAndSelect('game.secondPlayerProgress', 'spp')
        .leftJoinAndSelect('spp.player', 'sp')
        .where(new Brackets(qb => {
        qb.where('fp.id = :userId', {userId})
          .orWhere('sp.id = :userId', {userId})
        }))
  },

  async getViewGame(game: PairGame, userId, UserAnswersRepository, GameQuestionRepository) {
    const fPlayerId = game?.firstPlayerProgress.player.id
    const sPlayerId =
      game.secondPlayerProgress ?
      game.secondPlayerProgress.player.id : null

    //@ts-ignore
    const fPlayerProgressId = game!.firstPlayerProgress!.ppId!
    //@ts-ignore
    const sPlayerProgressId = game.secondPlayerProgress ? game!.secondPlayerProgress!.ppId! : null

    if(fPlayerId !== userId && sPlayerId !== userId)
      throw new HttpException('Forbidden', 403);

    const firstUserAnswers =
      await gameUtils.getUserAnswers(UserAnswersRepository, fPlayerProgressId)
    const secondUserAnswers =
      await gameUtils.getUserAnswers(UserAnswersRepository, sPlayerProgressId)

    const fpp =
      new createViewPlayerProgress(game!.firstPlayerProgress.score,
        firstUserAnswers, game.firstPlayerProgress.player)
    const spp =
      game.secondPlayerProgress
      ? new createViewPlayerProgress(game!.secondPlayerProgress!.score,
        secondUserAnswers, game.secondPlayerProgress.player)
      : null

    const gameQuestions =
      await this.getQuestionsForExistingGame(game, GameQuestionRepository)

    let viewGameQuestions: createViewGameQuestion[] | null = []

    if(gameQuestions.length){
      gameQuestions.map(gq => viewGameQuestions!
        .push(new createViewGameQuestion(gq.body, gq.questionId)))
    }
    else if (!gameQuestions.length) viewGameQuestions = null

    return new createViewPairGame(game.id, game.status, game.pairCreatedDate,
      game.startGameDate, game.finishGameDate, fpp, spp, viewGameQuestions)
  },

    async getRandomQuestions(questions: Question[], game: PairGame) {
      const viewQuestions: createViewGameQuestion[] = []
      const DBQuestions: createDBGameQuestion[] = []
      if(questions.length <= 5){
        questions.map(q => {
          viewQuestions.push(new createViewGameQuestion(q.body, q.id));
          DBQuestions.push(new createDBGameQuestion(game, q.id, q.body))
        })
      }
      else {
        let numbers: number[] = []

        while ([...new Set(numbers)].length < 5) {
          numbers.push(Math.floor(Math.random() *
            (questions.length + 1)))
        }

        questions.map((q, i) => {
          if (numbers.includes(i)) {
            viewQuestions.push(new createViewGameQuestion(q.body, q.id));
            DBQuestions.push(new createDBGameQuestion(game, q.id, q.body))
          }

        })
      }
        return { viewQuestions, DBQuestions }
    },

  createViewPairGame(id, pairCreatedDate, firstPlayerProgress){
    return {
        id,
        questions:  null,
        secondPlayerProgress: null,
        startGameDate: null,
        finishGameDate: null,
        status: 'PendingSecondPlayer',
        pairCreatedDate,
        firstPlayerProgress
      }
    },

  createDBPairGame(id, pairCreatedDate, firstPlayerProgress): PairGame{
    return {
      id,
      secondPlayerProgress: null,
      startGameDate: null,
      finishGameDate: null,
      status: 'PendingSecondPlayer',
      pairCreatedDate,
      firstPlayerProgress
    }
  },
  async finishGame(game, userId, currentPPID, UserAnswersRepository,
                   PairGameRepository, PlayerProgressRepository,
                   StatisticRepository) {

      const secondPPID = game.firstPlayerProgress.player.id === userId ?
        game.secondPlayerProgress!.ppId : game.firstPlayerProgress.ppId

    const firstUserAnswers: UserAnswers[] =
      await this.getUserAnswers(UserAnswersRepository, currentPPID)
    const secondUserAnswers: UserAnswers[] =
      await this.getUserAnswers(UserAnswersRepository, secondPPID)


    const firstUserScore = firstUserAnswers
      .filter(a => a.answerStatus === 'Correct').length
    const secondUserScore = secondUserAnswers
      .filter(a => a.answerStatus === 'Correct').length

      if(secondUserAnswers.length === 5) {
        let F_U_AddedPoint: boolean = false
        let S_U_AddedPoint: boolean = false

          if(firstUserAnswers[0].addedAt <
            secondUserAnswers[0].addedAt)
            S_U_AddedPoint = true
          if(firstUserAnswers[0].addedAt >
            secondUserAnswers[0].addedAt)
            F_U_AddedPoint = true

        if(F_U_AddedPoint && firstUserScore) {
          await PlayerProgressRepository
            .update({ppId: game.firstPlayerProgress.ppId},
              {score: () => 'score + 1'})
        }
        if(S_U_AddedPoint && secondUserScore) {
          await PlayerProgressRepository
            .update({ppId: game.secondPlayerProgress.ppId},
              {score: () => 'score + 1'})
        }

        await PairGameRepository
          .update({ id: game.id },
            { finishGameDate: new Date().toISOString(),
              status: 'Finished' });

        // update statistic

        const gameQuery = await this.getGameQuery(PairGameRepository)
        const finishedGame = await gameQuery
          .where('game.id = :id', {id: game.id})
          .getOne()

        // -   "avgScores": 2.43,
        // -   "drawsCount": 1,
        // -   "gamesCount": 7, ----
        // -   "lossesCount": 3,
        // -   "sumScore": 17, ----
        // -   "winsCount": 3,

        const isNoWinner =
          finishedGame.firstPlayerProgress.score === finishedGame.secondPlayerProgress.score

        const firstWinner =
          (finishedGame.firstPlayerProgress.score > finishedGame.secondPlayerProgress.score)

        const secondWinner =
          (finishedGame.firstPlayerProgress.score < finishedGame.secondPlayerProgress.score)

        await StatisticRepository.update(
          {userId: game.firstPlayerProgress.player.id},
          {sumScore: () => `sumScore + ${finishedGame.firstPlayerProgress.score}`,
            winsCount: () =>  firstWinner ? `winsCount + 1` : `winsCount + 0`,
             lossesCount: () => secondWinner ? `lossesCount + 1` : `lossesCount + 0`,
              drawsCount: () => !firstWinner && !secondWinner ? `drawsCount + 1` : `drawsCount + 0`,
               gamesCount: () => `gamesCount + 1`
           }
        )

        await StatisticRepository.update(
          {userId: game.secondPlayerProgress.player.id},
          {sumScore: () => `sumScore + ${finishedGame.secondPlayerProgress.score}`,
            winsCount: () =>  secondWinner ? `winsCount + 1` : `winsCount + 0`,
            lossesCount: () => firstWinner ? `lossesCount + 1` : `lossesCount + 0`,
            drawsCount: () => !firstWinner && !secondWinner ? `drawsCount + 1` : `drawsCount + 0`,
            gamesCount: () => `gamesCount + 1`
          }
        )


      }
    },

    async getQuestionsForExistingGame(game, GameQuestionRepository) {
      return await GameQuestionRepository
        .createQueryBuilder("gq")
        .leftJoinAndSelect("gq.game", 'game')
        .where("game.id = :gameId", {gameId: game.id})
        .getMany()
    },

    async connectSecondPlayerToGame(game, userId, DBSecondPlayerProgress, viewSecondPlayerProgress,
                                  GameQuestionRepository, PairGameRepository,
                                  PlayerProgressRepository, QuestionRepository) {
      const startGameDate = new Date().toISOString()

      if(game.firstPlayerProgress.player.id === userId)
        throw new HttpException('Forbidden', 403)

      const allQuestions =
        await QuestionRepository
          .createQueryBuilder("q")
          .getMany()

      const { viewQuestions, DBQuestions } =
        await this.getRandomQuestions(allQuestions, game)

      await GameQuestionRepository.save(DBQuestions)
      await PlayerProgressRepository.save(DBSecondPlayerProgress)
      await PairGameRepository
        .update({status: 'PendingSecondPlayer'},
          { secondPlayerProgress: DBSecondPlayerProgress,
            startGameDate,
            status: 'Active'
          })


      const firstPlayerProgress = await EntityUtils
        .getPlayerProgress(PlayerProgressRepository, //@ts-ignore
          game.firstPlayerProgress!.ppId!, [])

      return new createViewPairGame(
        game!.id, 'Active', game!.pairCreatedDate, startGameDate,
        null, firstPlayerProgress,
        viewSecondPlayerProgress, viewQuestions)
    },

    async connectFirstPlayerToGame(DBFirstPlayerProgress, viewFirstPlayerProgress,
                                   PairGameRepository, PlayerProgressRepository) {
      const id = uuid.v4()
      const pairCreatedDate = new Date().toISOString()

      await PlayerProgressRepository.save(DBFirstPlayerProgress)

      const dbPG =
        this.createDBPairGame(id, pairCreatedDate, DBFirstPlayerProgress)
      await PairGameRepository.save(dbPG)

      return this.createViewPairGame(id, pairCreatedDate, viewFirstPlayerProgress)
    },

    async addUserAnswer(game, userAnswers, answer, playerProgress,
                        PlayerProgressRepository, CorrectAnswersRepository,
                        UserAnswersRepository, GameQuestionRepository){
      const gameQuestions = await this
        .getQuestionsForExistingGame(game, GameQuestionRepository)

      const currentQuestion = gameQuestions[userAnswers.length]

      const correctAnswersDB =
        await CorrectAnswersRepository
          .createQueryBuilder("ca")
          .where("ca.questionId = :questionId",
            {questionId: currentQuestion.questionId})
          .getMany()

      const correctAnswersView: string[] = correctAnswersDB.map(ca => ca.answer)
      const answerStatus = correctAnswersView.includes(answer, 0) ? 'Correct' : 'Incorrect'

      const addedAt = new Date().toISOString()
      const newAnswer = new createUserAnswer
      (currentQuestion.questionId, answerStatus, addedAt, playerProgress.ppId)

      await UserAnswersRepository.save(newAnswer)

      if(answerStatus === 'Correct') await PlayerProgressRepository
        .update({ppId: playerProgress.ppId},
          {score: () => `score + 1`})

      return new createViewUserAnswer
      (currentQuestion.questionId, answerStatus, addedAt)
    },
}
