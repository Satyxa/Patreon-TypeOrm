import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './User.entity';
import { publish } from 'rxjs';
import { Player } from '../Quiz/Player.entity';

@Entity()
export class Statistic {
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  @PrimaryColumn()
  userId: string
  @OneToOne(() => Player, { onDelete: 'CASCADE' })
  @JoinColumn()
  player: Player
  @Column({type: 'int', default: 0})
  sumScore: number
  @Column({type: 'int', default: 0})
  gamesCount: number
  @Column({type: 'int', default: 0})
  winsCount: number
  @Column({type: 'int', default: 0})
  lossesCount: number
  @Column({type: 'int', default: 0})
  drawsCount: number
  @Column({type: 'numeric', default: 0})
  avgScores: number
}

// statistic must be created together with user and player


export class createViewStatistic {
  public avgScores: number = 0
  constructor(public sumScore: number,
              public gamesCount: number,
              public winsCount: number,
              public drawsCount: number,
              public lossesCount: number) {
    if(sumScore === 0) this.avgScores = 0
    else {
      const num = (sumScore / gamesCount).toFixed(2)
      const numSplit = num.split('.')

      this.avgScores = numSplit[1] === '00'
        ? Number(numSplit[0]) : Number(num)
    }
  }
}

export class createStatisticForTop {
  public avgScores: number = 0
  constructor(public sumScore: number,
              public gamesCount: number,
              public winsCount: number,
              public drawsCount: number,
              public lossesCount: number,
              public player: Player) {
    if(sumScore === 0) this.avgScores = 0
    else {
      const num = (sumScore / gamesCount).toFixed(2)
      const numSplit = num.split('.')

      this.avgScores = numSplit[1] === '00'
        ? Number(numSplit[0]) : Number(num)
    }
  }
}