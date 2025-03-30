import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  AfterLoad,
  Index,
} from 'typeorm';
import { Role } from './role.entity';
import { Article } from './article.entity';
import { Comment } from './comment.entity';
import { Image } from './image.entity';
import { Favorite } from './favorite.entity';

@Entity()
@Index(['username', 'account']) // 添加联合索引
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

  @Column({ type: 'varchar', length: 120 })
  signature: string;

  @Column({
    type: 'text',
    nullable: false,
    comment: '变更日志',
  })
  changeLog: string = '';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 用户角色（多对一）
  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  role: Role;

  // 用户发表的文章（一对多）
  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];

  // 用户点赞的文章（多对多）
  @ManyToMany(() => Article, (article) => article.likedBy, {
    cascade: true, // ✅ 允许级联操作
  })
  @JoinTable({
    name: 'user_liked_articles', // 明确中间表名
    joinColumn: { name: 'user_id' }, // 当前实体的外键
    inverseJoinColumn: { name: 'article_id' }, // 关联实体的外键
  })
  likedArticles: Article[];

  // 用户的评论（一对多）
  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  // 用户上传的图片（一对多）
  @OneToMany(() => Image, (image) => image.user)
  images: Image[];

  // 用户的收藏记录（一对多）
  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  // 关注关系（多对多自关联）
  @ManyToMany(() => User, (user) => user.followers)
  @JoinTable({
    name: 'user_following',
    joinColumn: { name: 'follower_id' },
    inverseJoinColumn: { name: 'following_id' },
  })
  following: User[];

  // 粉丝关系（多对多自关联的反向）
  @ManyToMany(() => User, (user) => user.following)
  followers: User[];

  // 虚拟字段（不持久化到数据库）
  followersCount?: number;
  followingCount?: number;
  totalArticles?: number;

  @AfterLoad()
  calculateStats() {
    this.followersCount = this.followers?.length || 0;
    this.followingCount = this.following?.length || 0;
    this.totalArticles = this.articles?.length || 0;
  }
}
