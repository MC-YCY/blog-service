import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Article } from './article.entity';

@Entity()
@Unique(['user', 'article']) // 确保用户不能重复收藏同一篇文章
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.favorites)
  user: User;

  @ManyToOne(() => Article, (article) => article.favorites, {
    onDelete: 'CASCADE', // 确保这里配置正确
  })
  article: Article; // 这里不配置任何级联选项

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date; // 收藏时间
}
