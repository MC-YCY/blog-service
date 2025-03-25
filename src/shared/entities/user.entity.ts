import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from './role.entity';
import { Article } from './article.entity';
import { Comment } from './comment.entity';
import { Image } from './image.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  account: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  avatar: string;

  @Column()
  signature: string;

  @Column({ default: '' })
  changeLog: string;

  // 用户角色（多对一）
  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  role: Role;

  // 用户发表的文章（一对多）
  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];

  // 用户点赞的文章（多对多）
  @ManyToMany(() => Article, (article) => article.likedBy)
  @JoinTable()
  likedArticles: Article[];

  // 用户的评论（一对多）
  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  // 在User类中添加
  @OneToMany(() => Image, (image) => image.user)
  images: Image[];
}
