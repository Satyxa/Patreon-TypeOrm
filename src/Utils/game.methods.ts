import { HttpException } from '@nestjs/common';
import { EntityUtils } from './EntityUtils';
import { createViewPairGame } from '../Entities/Quiz/PairGameEntity';
import * as uuid from 'uuid';
import { gameUtils } from './gameUtils';
import { createUserAnswer, createViewUserAnswer, UserAnswers } from '../Entities/Quiz/UserAnswersEntity';
import { Statistic } from '../Entities/User/StatisticEntity';

export const gameMethods = {
  async finishGame(game, currentPPId, enemyPPId, UserAnswersRepository,
                   PairGameRepository, PlayerProgressRepository,
                   StatisticRepository, GameQuestionRepository) {

    const currentPlayerAnswers: createViewUserAnswer[] =
      await gameUtils.getUserAnswers(UserAnswersRepository, currentPPId)
    const enemyPlayerAnswers: createViewUserAnswer[] =
      await gameUtils.getUserAnswers(UserAnswersRepository, enemyPPId)

    if(currentPlayerAnswers.length !== 5 || enemyPlayerAnswers.length !== 5){
      const loserAnswers =
        currentPlayerAnswers.length === 5
          ? enemyPlayerAnswers
          : currentPlayerAnswers

      const loserPPId =
        currentPlayerAnswers.length === 5
          ? enemyPPId
          : currentPPId

      const newAnswers: createUserAnswer[] = []

      const gameQuestions =
        await gameUtils.getQuestionsForExistingGame(game, GameQuestionRepository)

      for(let i = loserAnswers.length; i < gameQuestions.length; i++){
        newAnswers.push(
          new createUserAnswer(gameQuestions[i].questionId,
            'Incorrect', new Date().toISOString(), loserPPId))
      }

      await UserAnswersRepository
        .createQueryBuilder('ua')
        .insert()
        .values(newAnswers)
        .execute()
    }

    const firstPlayerAnswers: createViewUserAnswer[] =
      await gameUtils.getUserAnswers(UserAnswersRepository, game.firstPlayerProgress.ppId)
    const secondPlayerAnswers: createViewUserAnswer[] =
      await gameUtils.getUserAnswers(UserAnswersRepository, game.secondPlayerProgress.ppId)

    await this.countAddedPoint(
      firstPlayerAnswers, secondPlayerAnswers,
      PlayerProgressRepository, game)

    await PairGameRepository
      .update({ id: game.id },
        {
          finishGameDate: new Date().toISOString(),
          status: 'Finished'
        });

    const gameQuery = await gameUtils.getGameQuery(PairGameRepository)
    const finishedGame = await gameQuery
      .where('game.id = :id', { id: game.id })
      .getOne()

    await this.countStatistic(game, finishedGame, StatisticRepository)
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
      await gameUtils.getRandomQuestions(allQuestions, game)

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
      gameUtils.createDBPairGame(id, pairCreatedDate, DBFirstPlayerProgress)
    await PairGameRepository.save(dbPG)

    return gameUtils.createViewPairGame(id, pairCreatedDate, viewFirstPlayerProgress)
  },

  async addUserAnswer(game, userAnswers, answer, ppId,
                      PlayerProgressRepository, CorrectAnswersRepository,
                      UserAnswersRepository, GameQuestionRepository,
                      userLose = false){
    const addedAt = new Date().toISOString()

    const gameQuestions = await gameUtils
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

    const newAnswer = new createUserAnswer
    (currentQuestion.questionId, answerStatus, addedAt, ppId)

    await UserAnswersRepository.save(newAnswer)

    if(answerStatus === 'Correct') await PlayerProgressRepository
      .update(ppId, {score: () => `score + 1`})

    return new createViewUserAnswer
    (currentQuestion.questionId, answerStatus, addedAt)
  },

  async countStatistic(game, finishedGame, StatisticRepository) {
    const fpId = game.firstPlayerProgress.player.id
    const spId = game.secondPlayerProgress.player.id

    const firstWinner =
      (finishedGame.firstPlayerProgress.score > finishedGame.secondPlayerProgress.score)

    const secondWinner =
      (finishedGame.firstPlayerProgress.score < finishedGame.secondPlayerProgress.score)

    await gameUtils.updateStatistic(StatisticRepository,
      fpId, finishedGame, firstWinner, secondWinner)

    await gameUtils.updateStatistic(StatisticRepository,
      spId, finishedGame, firstWinner, secondWinner)


    const firstUserStatistic: Statistic = await StatisticRepository
      .findOneBy({userId: fpId})
    const secondUserStatistic: Statistic = await StatisticRepository
      .findOneBy({userId: spId})

    const firstAS = firstUserStatistic.gamesCount
      ? firstUserStatistic.sumScore / firstUserStatistic.gamesCount : 0

    const secondAS =  secondUserStatistic.gamesCount
      ? secondUserStatistic.sumScore / secondUserStatistic.gamesCount : 0

    await StatisticRepository
      .update({userId: fpId}, {avgScores: firstAS})

    await StatisticRepository
      .update({userId: spId}, {avgScores: secondAS})
  },

  async countAddedPoint(firstPlayerAnswers, secondPlayerAnswers,
                        PlayerProgressRepository, game){

    const firstPlayerScore = firstPlayerAnswers
      .filter(a => a.answerStatus === 'Correct').length
    const secondPlayerScore = secondPlayerAnswers
      .filter(a => a.answerStatus === 'Correct').length

    let F_U_AddedPoint: boolean = false
    let S_U_AddedPoint: boolean = false

    if(!firstPlayerAnswers.length) S_U_AddedPoint = true
    if(!secondPlayerAnswers.length) F_U_AddedPoint = true

    if(!F_U_AddedPoint && !S_U_AddedPoint){
      if (firstPlayerAnswers[4].addedAt >
        secondPlayerAnswers[4].addedAt)
        S_U_AddedPoint = true;

      else F_U_AddedPoint = true
    }

    if(F_U_AddedPoint && firstPlayerScore)
      await gameUtils.addPoint(PlayerProgressRepository, game.firstPlayerProgress.ppId)

    if(S_U_AddedPoint && secondPlayerScore)
      await gameUtils.addPoint(PlayerProgressRepository, game.secondPlayerProgress.ppId)

  },
}