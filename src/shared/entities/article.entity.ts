import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Comment } from './comment.entity';

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // 文章作者（多对一）
  @ManyToOne(() => User, (user) => user.articles)
  author: User;

  // 文章点赞的用户（多对多）
  @ManyToMany(() => User, (user) => user.likedArticles)
  likedBy: User[];

  // 文章的评论（一对多）
  @OneToMany(() => Comment, (comment) => comment.article)
  comments: Comment[];
}
