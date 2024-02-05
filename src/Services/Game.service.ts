import { createViewGameQuestion, GameQuestions } from '../Entities/Quiz/GameQuestionsEntity';
import { createNewPairGame, createViewPairGame, PairGame } from '../Entities/Quiz/PairGameEntity';
import { CorrectAnswers } from '../Entities/Quiz/CorrectAnswersEntity';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Player } from '../Entities/Quiz/PlayerEntity';
import { Question } from '../Entities/Quiz/QuestionEntity';
import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { gameUtils } from '../Utils/gameUtils';
import {
  createDBPlayerProgress,
  createViewPlayerProgress, PlayerProgress,
} from '../Entities/Quiz/PlayerProgressEntity';
import * as uuid from 'uuid'
import { EntityUtils } from '../Utils/EntityUtils';
import { CheckEntityId } from '../Utils/checkEntityId';
import { createUserAnswer, createViewUserAnswer, UserAnswers } from '../Entities/Quiz/UserAnswersEntity';
import { getLogger } from 'nodemailer/lib/shared';

@Injectable()
export class GameService {
    constructor(@InjectRepository(PairGame)
                private readonly PairGameRepository: Repository<PairGame>,
                @InjectRepository(GameQuestions)
                private readonly GameQuestionRepository: Repository<GameQuestions>,
                @InjectRepository(Player)
                private readonly PlayerRepository: Repository<Player>,
                @InjectRepository(Question)
                private readonly QuestionRepository: Repository<Question>,
                @InjectRepository(PlayerProgress)
                private readonly PlayerProgressRepository: Repository<PlayerProgress>,
                @InjectRepository(UserAnswers)
                private readonly UserAnswersRepository: Repository<UserAnswers>,
                @InjectRepository(CorrectAnswers)
                private readonly CorrectAnswersRepository: Repository<CorrectAnswers>,
    ) {
    }

    async deleteAll() {
        // await this.QuestionRepository.delete({})
        await this.GameQuestionRepository.delete({})
        await this.PairGameRepository.delete({})
        await this.PlayerProgressRepository.delete({})
    }

    async getActiveGame(userId) {
      // need to find active game for current user
      const query = await gameUtils.findCurrentGame(this.PairGameRepository, userId)

      const game = await query
        .where(new Brackets(qb => {
          qb.where('game.status = :Active', {Active: 'Active'})
            .orWhere('game.status = :PendingSecondPlayer', {PendingSecondPlayer: 'PendingSecondPlayer'})
        }))
        .andWhere(new Brackets(qb => {
          qb.where('fp.id = :userId', {userId})
            .orWhere('sp.id = :userId', {userId})
        }))
        .getOne()

      if(!game) throw new HttpException('Not Found', 404)

      return gameUtils
        .getViewGame(game, userId, this.UserAnswersRepository, this.GameQuestionRepository)

    }


    async getGameById(id, userId) {
      const game: PairGame = await CheckEntityId
        .checkGameId(this.PairGameRepository, id)

      if(!game) throw new HttpException('Not Found', 404)

      return gameUtils
        .getViewGame(game, userId, this.UserAnswersRepository, this.GameQuestionRepository)
    }

    async setConnectToGame(userId) {
      const gameQuery = await gameUtils.getGameQuery(this.PairGameRepository)

      // CHECK AVAILABLE GAME
      // founded game must be in status pending because active game have maximum players
      const game: PairGame | null = await gameQuery
        .where('game.status = :status', {status: 'PendingSecondPlayer'})
        .getOne()

      // if user already have active game he must finish the game before connect to new
      await gameUtils.isUserAlreadyHaveActiveGame(gameQuery, userId)

      // need create player and progress for him anyway
      const player = await this.PlayerRepository.findOneBy({id: userId})
      if(!player) return console.log('игрока нет чота не так, GAME: ' + game, ', USERID: ' + userId);

      // new PP so all values is default
      const DBPlayerProgress =
        new createDBPlayerProgress(0,  player)

      const viewPlayerProgress =
        new createViewPlayerProgress(0, [], player)

      if(game) {
        // need add playerProgress and set status game start
        // also need add question to game because if game hasn't started yet,
        // questions must be null

        if(game.firstPlayerProgress.player.id === userId)
          throw new HttpException('Forbidden', 403)

        const startGameDate = new Date().toISOString()

        // require all question to get questions for game later
        const allQuestions = await this.QuestionRepository
          .createQueryBuilder("q")
          // .where("q.published = :status", {status: true})
          .getMany()

        // get random questions for game
        const { viewQuestions, DBQuestions } =
          await gameUtils.getRandomQuestions(allQuestions, game)

        // save questions
        await this.GameQuestionRepository.save(DBQuestions)

        // save new PP
        await this.PlayerProgressRepository.save(DBPlayerProgress)

        // update Game
        await this.PairGameRepository
          .update({status: 'PendingSecondPlayer'},
            {
              secondPlayerProgress: DBPlayerProgress,
              startGameDate,
              status: 'Active'
            })


        const pp = await EntityUtils
          .getPlayerProgress(this.PlayerProgressRepository,
            game.firstPlayerProgress.player.id, [])
        return new createViewPairGame(
          game.id, 'Active', game.pairCreatedDate, startGameDate,
          null, pp!,
          viewPlayerProgress, viewQuestions)

      }
      else if(!game){
        // if no game so need to create new with status pending

        const id = uuid.v4()
        const pairCreatedDate = new Date().toISOString()

        await this.PlayerProgressRepository.save(DBPlayerProgress)

        const dbPG =
          gameUtils.createDBPairGame(id, pairCreatedDate, DBPlayerProgress)
        await this.PairGameRepository.save(dbPG)

        return gameUtils.createViewPairGame(id, pairCreatedDate, viewPlayerProgress)
      }
      else console.log('124str game service');
    }

    async sendAnswer(answer, userId) {

      const query = await gameUtils.findCurrentGame(this.PairGameRepository, userId)
      const game: PairGame | null = await query
        .where('game.status = :status', {status: 'Active'})
        .andWhere(new Brackets(qb => {
          qb.where('fp.id = :userId', {userId})
            .orWhere('sp.id = :userId', {userId})
        }))
        .getOne()

      if(!game) throw new HttpException('Forbidden', 403)

      // first need to get player progress
      // @ts-ignore
      const playerProgress: PlayerProgress =
        game.firstPlayerProgress.player.id === userId ?
          game.firstPlayerProgress : game.secondPlayerProgress

      // then need to check for which question is answer
      // for that first need find all user answers

      const userAnswers =
        await this.UserAnswersRepository
        .createQueryBuilder('ua')
        .where('ua.ppId = :ppId', {ppId: playerProgress.ppId})
          .getMany()

      if(userAnswers.length === 5)
        throw new HttpException('Forbidden', 403)

      // and then all game questions

      const gameQuestions =
        await this.GameQuestionRepository
          .createQueryBuilder("gq")
          .leftJoinAndSelect("gq.game", 'game')
          .where("game.id = :gameId", {gameId: game.id})
          .getMany()

      // Now need to know for which question is answer

      const currentQuestion = gameQuestions[userAnswers.length]

      if (userAnswers.length === 5) throw new HttpException('Forbidden', 403)

      // Now searching correct answer

      const correctAnswersDB =
        await this.CorrectAnswersRepository
          .createQueryBuilder("ca")
          .where("ca.questionId = :questionId",
            {questionId: currentQuestion.questionId})
          .getMany()

      const correctAnswers = correctAnswersDB.map(ca => ca.answer)

      const answerStatus = correctAnswers.includes(answer, 0) ? 'Correct' : 'Incorrect'

      const addedAt = new Date().toISOString()

      const newAnswer =
        new createUserAnswer
        (currentQuestion.questionId, answerStatus, addedAt, playerProgress.ppId)

      await this.UserAnswersRepository.save(newAnswer)

      if(answerStatus === 'Correct') await this.PlayerProgressRepository
        .update({ppId: playerProgress.ppId},
          {score: () => `score + 1`})

      if(userAnswers.length === 4)
        await gameUtils.finishGame(game, userId,
          this.UserAnswersRepository, this.PairGameRepository,
          this.PlayerProgressRepository)

      return new createViewUserAnswer
      (currentQuestion.questionId, answerStatus, addedAt)

    }

}