import * as uuid from 'uuid'
// import {createQuestionForPP, Question} from "../Entities/Quiz/QuestionEntity";
//
// import {Brackets, Repository} from "typeorm";
// import {BadRequestException, HttpException} from "@nestjs/common";
// import {EntityUtils} from "./EntityUtils";
// import {CheckEntityId} from "./checkEntityId";
import {User} from "../Entities/User/UserEntity";
import { Brackets, Repository } from 'typeorm';
import { createNewPairGame, createViewPairGame, PairGame } from '../Entities/Quiz/PairGameEntity';
import { BadRequestException, HttpException } from '@nestjs/common';
import { createViewQuestion, Question } from '../Entities/Quiz/QuestionEntity';
import { createDBGameQuestion, createViewGameQuestion } from '../Entities/Quiz/GameQuestionsEntity';
import { createViewUserAnswer, UserAnswers } from '../Entities/Quiz/UserAnswersEntity';
import { createViewPlayerProgress } from '../Entities/Quiz/PlayerProgressEntity';

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
  },

  async getViewGame(game: PairGame, userId, UserAnswersRepository, GameQuestionRepository) {
    //
    // if(!game.secondPlayerProgress) return console.log('second player null get game by id, game: ', game)

    const fPlayerId = game?.firstPlayerProgress.player.id
    const sPlayerId =
      game.secondPlayerProgress ?
      game.secondPlayerProgress.player.id : null

    //@ts-ignore
    const fPlayerProgressId = game!.firstPlayerProgress!.ppId!
    //@ts-ignore
    const sPlayerProgressId = game.secondPlayerProgress ? game!.secondPlayerProgress!.ppId! : null

    // check that current user was playing current game
    if(fPlayerId !== userId && sPlayerId !== userId)
      throw new HttpException('Forbidden', 403);


    // if we here, that mean gameId is correct
    // and user is participant this game

    // get answers for users to create view player progress later
    const firstUserAnswers =
      await gameUtils.getUserAnswers(UserAnswersRepository, fPlayerProgressId)

    const secondUserAnswers =
      await gameUtils.getUserAnswers(UserAnswersRepository, sPlayerProgressId)

    // create view player progress

    const fpp =
      new createViewPlayerProgress(game!.firstPlayerProgress.score,
        firstUserAnswers, game.firstPlayerProgress.player)
    const spp =
      game.secondPlayerProgress
      ? new createViewPlayerProgress(game!.secondPlayerProgress!.score,
        secondUserAnswers, game.secondPlayerProgress.player)
      : null


    const gameQuestions = await GameQuestionRepository
      .createQueryBuilder('gq')
      .leftJoinAndSelect('gq.game', 'game')
      .where('game.id = :id', {id: game.id})
      .getMany()

    let viewGameQuestions: createViewGameQuestion[] | null = []

    if(gameQuestions.length){
      gameQuestions.map(gq => {
        viewGameQuestions!.push(new createViewGameQuestion(gq.body, gq.questionId))
      })
    } else if (!gameQuestions.length) viewGameQuestions = null


    const viewPairGame = new createViewPairGame(game.id, game.status, game.pairCreatedDate,
      game.startGameDate, game.finishGameDate, fpp, spp, viewGameQuestions)

    return viewPairGame
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
  async finishGame(game, userId, UserAnswersRepository,
                   PairGameRepository, PlayerProgressRepository) {

      const secondPPID = game.firstPlayerProgress.player.id === userId ?
        //@ts-ignore
        game.secondPlayerProgress!.ppId : game.firstPlayerProgress.ppId

    const firstUserAnswers: UserAnswers[] =
      await UserAnswersRepository
        .createQueryBuilder('sua')
        .where('sua.ppId = :secondPPID', {secondPPID})
        .getMany()

      const secondUserAnswers: UserAnswers[] =
        await UserAnswersRepository
          .createQueryBuilder('sua')
          .where('sua.ppId = :secondPPID', {secondPPID})
          .getMany()

    const firstUserScore = firstUserAnswers
      .filter(a => a.answerStatus === 'Correct').length

    const secondUserScore = firstUserAnswers
      .filter(a => a.answerStatus === 'Correct').length

      if(secondUserAnswers.length === 5) {

        // need to get all answers both users

        const F_U_AddedPoint: boolean[] = []
        const S_U_AddedPoint: boolean[] = []

        for(let i = 0; i < 5; i++){
          if(new Date(firstUserAnswers[i].addedAt) >
            new Date(secondUserAnswers[i].addedAt)){
            F_U_AddedPoint.push(false)
            S_U_AddedPoint.push(true)
          } else {
            F_U_AddedPoint.push(true)
            S_U_AddedPoint.push(false)
          }
        }

        if(!F_U_AddedPoint.includes(false) && firstUserScore) {
          console.log(F_U_AddedPoint);
          await PlayerProgressRepository
            .update({ppId: game.firstPlayerProgress.ppId},
              {score: () => 'score + 1'})
        }
        else if(!S_U_AddedPoint.includes(false) && secondUserScore) {
          await PlayerProgressRepository
            .update({ppId: game.secondPlayerProgress.ppId},
              {score: () => 'score + 1'})
        }

        await PairGameRepository
          .update({ id: game.id },
            { finishGameDate: new Date().toISOString(),
              status: 'Finished' });
      }
    }
}
