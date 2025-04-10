import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../shared/entities/user.entity';
import { Article } from '../shared/entities/article.entity';

export enum NotificationType {
  FOLLOW = 'FOLLOW',
  LIKE = 'LIKE',
  FAVORITE = 'FAVORITE',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @ManyToOne(() => Article, { nullable: true })
  @JoinColumn({ name: 'article_id' })
  article: Article | null; // 明确声明可为 null

  // 是关注，还是取消
  @Column()
  isStart: boolean;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
