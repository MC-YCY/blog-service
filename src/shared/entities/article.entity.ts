import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany,
  AfterLoad,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Comment } from './comment.entity';
import { Favorite } from './favorite.entity';
import { ArticleStatus } from '../enums/article-status.enum';

@Entity()
@Index(['id', 'viewCount'])
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

  @Column('text')
  readme: string;

  @Column('mediumtext')
  banner: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    default: 0,
    comment: '浏览计数',
    type: 'int',
    unsigned: true,
  })
  viewCount: number;

  @ManyToOne(() => User, (user) => user.articles)
  author: User;

  @ManyToMany(() => User, (user) => user.likedArticles, {
    onDelete: 'CASCADE',
  })
  likedBy: User[];

  @OneToMany(() => Comment, (comment) => comment.article, {
    onDelete: 'CASCADE',
  })
  comments: Comment[];

  @OneToMany(() => Favorite, (favorite) => favorite.article, {
    onDelete: 'CASCADE', // 数据库级联删除
    cascade: ['insert', 'update', 'remove'], // 允许通过ORM级联操作
  })
  favorites: Favorite[];

  @Column({
    type: 'enum',
    enum: ArticleStatus,
    default: ArticleStatus.DRAFT,
  })
  status: ArticleStatus;

  // 虚拟字段
  likeCount: number;

  @AfterLoad()
  calculateMetrics() {
    this.likeCount = this.likedBy?.length || 0;
    // 可以继续添加其他计算字段
  }
}
