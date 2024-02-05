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
import { pairsPS } from '../Utils/PaginationAndSort';

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
        await this.QuestionRepository.delete({})
        await this.GameQuestionRepository.delete({})
        await this.PairGameRepository.delete({})
        await this.PlayerProgressRepository.delete({})
        await this.CorrectAnswersRepository.delete({})
    }

    async getActiveGame(userId) {
      const query = await gameUtils.findCurrentGame(this.PairGameRepository, userId)
      const game = await query
        .andWhere(new Brackets(qb => {
          qb.where('game.status = :Active', {Active: 'Active'})
            .orWhere('game.status = :PendingSecondPlayer', {PendingSecondPlayer: 'PendingSecondPlayer'})
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
      const game: PairGame | null = await gameQuery
        .where('game.status = :status', {status: 'PendingSecondPlayer'})
        .getOne()

      await gameUtils.isUserAlreadyHaveActiveGame(gameQuery, userId)

      const player = await this.PlayerRepository.findOneBy({id: userId})

      const DBPlayerProgress =
        new createDBPlayerProgress(0,  player!)

      const viewPlayerProgress =
        new createViewPlayerProgress(0, [], player!)

      if(game) {
        return await gameUtils.connectSecondPlayerToGame(
          game, userId, DBPlayerProgress, viewPlayerProgress,
          this.GameQuestionRepository, this.PairGameRepository,
          this.PlayerProgressRepository, this.QuestionRepository
        )
      }
      else if(!game){
        return await gameUtils.connectFirstPlayerToGame(
          DBPlayerProgress, viewPlayerProgress,
          this.PairGameRepository, this.PlayerProgressRepository
        )
      }
    }

    async sendAnswer(answer, userId) {
      const query = await gameUtils.findCurrentGame(this.PairGameRepository, userId)
      const game: PairGame | null = await query
        .andWhere('game.status = :status', {status: 'Active'})
        .getOne()

      if(!game) throw new HttpException('Forbidden', 403)

      const playerProgress: PlayerProgress =
        game.firstPlayerProgress.player.id === userId
          ? game.firstPlayerProgress as PlayerProgress
          : game.secondPlayerProgress as PlayerProgress

      const userAnswers =
        await gameUtils.getUserAnswers(this.UserAnswersRepository, playerProgress.ppId)

      if(userAnswers.length === 5)
        throw new HttpException('Forbidden', 403)

      const viewUserAnswer =
        await gameUtils.addUserAnswer(
        game, userAnswers, answer, playerProgress,
        this.PlayerProgressRepository, this.CorrectAnswersRepository,
        this.UserAnswersRepository, this.GameQuestionRepository)

      if(userAnswers.length === 4)
        await gameUtils.finishGame(
          game, userId, playerProgress.ppId,
          this.UserAnswersRepository, this.PairGameRepository,
          this.PlayerProgressRepository)

      return viewUserAnswer
    }

    async getMe(payload, userId) {
      const query = await gameUtils.getGameQuery(this.PairGameRepository)

      const {pairs, pagesCount, pageNumber, pageSize, totalCount} =
      await pairsPS(payload, userId, query)

      return pairs.map(async (game) => {

        const firstUserAnswers = await gameUtils
          .getUserAnswers(this.UserAnswersRepository, game.firstPlayerProgress.ppId)

        const secondUserAnswers = await gameUtils
          .getUserAnswers(this.UserAnswersRepository, game.secondPlayerProgress.ppId)

        const firstPlayerProgress =
          new createViewPlayerProgress(game.firstPlayerProgress.score,
            firstUserAnswers, game.firstPlayerProgress.player)

        const secondPlayerProgress =
          new createViewPlayerProgress(game.secondPlayerProgress.score,
            secondUserAnswers, game.secondPlayerProgress.player)

        const gameQuestions = await gameUtils
          .getQuestionsForExistingGame(game, this.GameQuestionRepository)

        return new createViewPairGame(
          game.id, game.status, game.pairCreatedDate,
          game.startGameDate, game.finishGameDate,
          firstPlayerProgress, secondPlayerProgress,
          gameQuestions
        );
      })

    }

}