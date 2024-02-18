import * as uuid from 'uuid'
import { Brackets } from 'typeorm';
import { createViewPairGame, PairGame } from '../Entities/Quiz/PairGame.entity';
import { HttpException } from '@nestjs/common';
import { Question } from '../Entities/Quiz/Question.entity';
import { createDBGameQuestion, createViewGameQuestion } from '../Entities/Quiz/GameQuestions.entity';
import { createUserAnswer, createViewUserAnswer, UserAnswers } from '../Entities/Quiz/UserAnswers.entity';
import { createViewPlayerProgress } from '../Entities/Quiz/PlayerProgress.entity';
import { EntityUtils } from './Entity.utils';
import { Statistic } from '../Entities/User/Statistic.entity';
import { addSeconds } from 'date-fns';

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

    async getQuestionsForExistingGame(game, GameQuestionRepository) {
      return await GameQuestionRepository
        .createQueryBuilder("gq")
        .leftJoinAndSelect("gq.game", 'game')
        .where("game.id = :gameId", {gameId: game.id})
        .getMany()
    },

  async addPoint(PlayerProgressRepository, ppId) {
    await PlayerProgressRepository
      .update(ppId,
        {score: () => 'score + 1'})
  },

  async updateStatistic(StatisticRepository, pId, finishedGame,
                        firstWinner, secondWinner) {
    await StatisticRepository.update(
      {userId: pId},
      {sumScore: () => `sumScore + ${finishedGame.firstPlayerProgress.score}`,
        winsCount: () =>  firstWinner ? `winsCount + 1` : `winsCount + 0`,
        lossesCount: () => secondWinner ? `lossesCount + 1` : `lossesCount + 0`,
        drawsCount: () => !firstWinner && !secondWinner ? `drawsCount + 1` : `drawsCount + 0`,
        gamesCount: () => `gamesCount + 1`,
      }
    )
  }
}
