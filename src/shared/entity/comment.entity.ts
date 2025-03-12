import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Article } from './article.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // 评论的作者（多对一）
  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  author: User;

  // 评论所属的文章（多对一）
  @ManyToOne(() => Article, (article) => article.comments, {
    onDelete: 'CASCADE',
  })
  article: Article;
}
