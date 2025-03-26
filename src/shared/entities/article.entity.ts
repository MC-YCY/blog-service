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
import { Favorite } from './favorite.entity';
import { ArticleStatus } from '../enums/article-status.enum';

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({
    type: 'json',
    comment: '字典键值对（如：[vue,react,angular]',
  })
  tags: Array<string>;

  @Column()
  readme: string;

  @Column()
  banner: string;

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

  @OneToMany(() => Favorite, (favorite) => favorite.article)
  favorites: Favorite[]; // 文章被收藏的所有记录

  @Column({
    type: 'enum',
    enum: ArticleStatus,
    default: ArticleStatus.DRAFT,
  })
  status: ArticleStatus;
}
