import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { Article } from '../entities/article.entity';
import { User } from '../entities/user.entity';
import {
  CreateArticleDto,
  PaginateArticleDto,
  UpdateArticleDto,
} from '../dto/article.dto';
import { ArticleStatus } from '../enums/article-status.enum';
import { Favorite } from '../entities/favorite.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,
    private eventEmitter: EventEmitter2,
  ) {}

  // 创建文章
  async create(userId: number, createDto: CreateArticleDto): Promise<Article> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');

    // 设置默认状态
    const status = createDto.status || ArticleStatus.PUBLISHED;

    const article = this.articleRepo.create({
      ...createDto,
      status,
      author: user,
    });

    return await this.articleRepo.save(article);
  }

  // 分页查询所有文章（可选状态过滤）
  async paginate(query: PaginateArticleDto) {
    const { page = 1, limit = 10, status } = query;

    const options: FindManyOptions<Article> = {
      where: status ? { status } : {},
      relations: ['author'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    const [items, total] = await this.articleRepo.findAndCount(options);
    return { items, total };
  }

  // 根据标题模糊查询文章（不限定文章状态）
  async searchByTitle(title: string, query: PaginateArticleDto) {
    const { page = 1, limit = 10 } = query;

    const options: FindManyOptions<Article> = {
      where: { title: Like(`%${title}%`) },
      relations: ['author'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    const [items, total] = await this.articleRepo.findAndCount(options);
    return { items, total };
  }

  // 查询所有审核通过的文章，并支持根据标题模糊查询
  async searchApprovedByTitle(
    page: number,
    limit: number,
    title: string,
    tag: string,
  ) {
    const options: FindManyOptions<Article> = {
      where: {
        title: Like(`%${title}%`),
        status: ArticleStatus.PUBLISHED, // 请确认枚举中审核通过状态的名称
        tags: Like(`%${tag}%`),
      },
      relations: ['author'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    const [items, total] = await this.articleRepo.findAndCount(options);
    return { items, total };
  }

  // 更新文章
  async update(
    userId: number,
    articleId: number,
    updateDto: UpdateArticleDto,
  ): Promise<Article> {
    const article = await this.articleRepo.findOne({
      where: { id: articleId },
      relations: ['author'],
    });

    if (!article) throw new NotFoundException('文章不存在');

    // 记录原来的状态
    const oldStatus = article.status;

    // 状态变更权限验证（示例逻辑）
    if (updateDto.status) {
      if (article.author.id !== userId) {
        throw new ForbiddenException('只有作者可以修改文章状态');
      }

      // 添加状态流转规则（示例）
      const validTransitions = {
        [ArticleStatus.DRAFT]: [ArticleStatus.PENDING_REVIEW],
        [ArticleStatus.PENDING_REVIEW]: [ArticleStatus.DRAFT],
        [ArticleStatus.REJECTED]: [ArticleStatus.PENDING_REVIEW],
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      if (!validTransitions[article.status]?.includes(updateDto.status)) {
        throw new ForbiddenException('不允许的状态变更');
      }
    }

    const updatedArticle = await this.articleRepo.save({
      ...article,
      ...updateDto,
    });

    // 如果状态发生了变化，则通过 WebSocket 通知文章作者
    if (updateDto.status && updateDto.status !== oldStatus) {
      // const message = `您的文章 "${article.title}" 状态已更改为: ${updateDto.status}`;
    }

    return updatedArticle;
  }

  // 删除文章
  async delete(userId: number, articleId: number): Promise<void> {
    const article = await this.articleRepo.findOne({
      where: { id: articleId },
      relations: ['author'],
    });

    if (!article) throw new NotFoundException('文章不存在');
    if (article.author.id !== userId) {
      throw new ForbiddenException('无权删除此文章');
    }

    await this.articleRepo.remove(article);
  }

  // 根据用户分页查询文章
  async paginateByUser(
    userId: number,
    query: PaginateArticleDto,
    isLoginUser: boolean = false,
  ) {
    const { page = 1, limit = 10 } = query;
    const where = {
      author: { id: userId },
      tags: Like(`%${query.tag}%`),
    };
    // 判断是否是登录用户请求，如果是返回所有状态文章不是则返回，已发布
    if (!isLoginUser) {
      where['status'] = ArticleStatus.PUBLISHED;
    }
    const options: FindManyOptions<Article> = {
      where: where,
      relations: ['author'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    const [items, total] = await this.articleRepo.findAndCount(options);
    return { items, total };
  }

  async findOne(articleId: number): Promise<any> {
    // 原子操作：增加浏览量
    await this.articleRepo.increment({ id: articleId }, 'viewCount', 1);

    // 查询并加载关联数据，包括作者及其粉丝
    const article = await this.articleRepo.findOne({
      where: { id: articleId },
      relations: [
        'author',
        'author.followers', // 加载作者粉丝
        'likedBy', // 加载点赞的用户
        'favorites', // 加载收藏记录
        'comments', // 如果需要评论数
      ],
    });

    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    // 计算额外的统计数据
    article.likeCount = article.likedBy ? article.likedBy.length : 0;
    const favoritesCount = article.favorites ? article.favorites.length : 0;
    const authorFollowersCount =
      article.author && article.author.followers
        ? article.author.followers.length
        : 0;

    // 返回文章信息及统计数据
    return {
      ...article,
      favoritesCount,
      authorFollowersCount,
      viewCount: article.viewCount, // 浏览量
    };
  }

  async getLatestArticlesGroupedByDate(): Promise<
    { date: string; posts: Article[] }[]
  > {
    // 获取最近5个有文章的日期（仅PUBLISHED状态）
    const dateResults = await this.articleRepo
      .createQueryBuilder('article')
      .select('DATE(article.createdAt)', 'date')
      .where('article.status = :status', {
        status: ArticleStatus.PUBLISHED, // 添加状态过滤
      })
      .distinct(true)
      .orderBy('date', 'DESC')
      .limit(5)
      .getRawMany();

    const result: { date: string; posts: Article[] }[] = [];
    for (const dateObj of dateResults) {
      // 查询每个日期的前4篇已发布文章
      const posts = await this.articleRepo
        .createQueryBuilder('article')
        .leftJoinAndSelect('article.author', 'author')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
        .where('DATE(article.createdAt) = :date', { date: dateObj.date })
        .andWhere('article.status = :status', {
          // 添加状态过滤
          status: ArticleStatus.PUBLISHED,
        })
        .orderBy('article.createdAt', 'DESC')
        .take(4)
        .getMany();

      result.push({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
        date: dateObj.date, // 保持日期格式化
        posts,
      });
    }
    return result;
  }

  // 获取用户与文章的交互状态
  async getArticleInteractionStatus(
    userId: number,
    articleId: number,
  ): Promise<{
    isFollowingAuthor: boolean;
    isLiked: boolean;
    isFavorited: boolean;
  }> {
    const article = await this.articleRepo.findOne({
      where: { id: articleId },
      relations: ['author'],
    });

    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    // 用户有效性验证
    const userExists = await this.userRepo.exist({
      where: { id: userId },
    });
    if (!userExists) {
      throw new NotFoundException('用户不存在');
    }

    // 是否关注作者
    const isFollowingAuthor = await this.userRepo
      .createQueryBuilder('user')
      .innerJoin('user.following', 'following', 'following.id = :authorId', {
        authorId: article.author.id,
      })
      .where('user.id = :userId', { userId })
      .getCount()
      .then((count) => count > 0);

    // 是否喜欢文章
    const isLiked = await this.userRepo
      .createQueryBuilder('user')
      .innerJoin('user.likedArticles', 'article', 'article.id = :articleId', {
        articleId,
      })
      .where('user.id = :userId', { userId })
      .getCount()
      .then((count) => count > 0);

    // 是否收藏
    const isFavorited = await this.favoriteRepo
      .createQueryBuilder('favorite')
      .where('favorite.userId = :userId AND favorite.articleId = :articleId', {
        userId,
        articleId,
      })
      .getCount()
      .then((count) => count > 0);

    return { isFollowingAuthor, isLiked, isFavorited };
  }

  // 切换关注作者
  async toggleFollowAuthor(
    currentUserId: number,
    authorId: number,
  ): Promise<boolean> {
    const currentUser = await this.userRepo.findOne({
      where: { id: currentUserId },
      relations: ['following'],
    });
    if (!currentUser) {
      throw new ForbiddenException('无效的用户操作');
    }
    const isFollowing = currentUser.following.some((u) => u.id === authorId);
    const author = await this.userRepo.findOneBy({ id: authorId });
    if (!author) {
      throw new NotFoundException('关注用户不存在');
    }
    if (isFollowing) {
      currentUser.following = currentUser.following.filter(
        (u) => u.id !== authorId,
      );
    } else {
      currentUser.following.push(author);
    }

    await this.userRepo.save(currentUser);

    if (currentUserId === authorId) return !isFollowing;
    // 触发关注通知
    this.eventEmitter.emit('notification.follow', {
      senderId: currentUserId,
      receiverId: authorId,
      isStart: !isFollowing,
    });
    return !isFollowing;
  }

  // 切换喜欢文章
  async toggleLikeArticle(userId: number, articleId: number): Promise<boolean> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['likedArticles'], // ✅ 必须加载关联
    });
    if (!user) throw new ForbiddenException('用户状态异常');

    const article = await this.articleRepo.findOne({
      where: { id: articleId },
      relations: ['author'],
    });
    if (!article) throw new NotFoundException('文章不存在');

    const isLiked = user.likedArticles.some((a) => a.id === Number(articleId));

    if (isLiked) {
      user.likedArticles = user.likedArticles.filter(
        (a) => a.id !== Number(articleId),
      );
    } else {
      user.likedArticles.push(article);
    }

    // 强制保存并刷新关联
    await this.userRepo.save(user);
    await this.userRepo
      .createQueryBuilder()
      .relation(User, 'likedArticles')
      .of(user)
      .loadMany(); // ✅ 强制重新加载关联数据

    if (userId === articleId) return !isLiked;
    this.eventEmitter.emit('notification.like', {
      senderId: userId,
      receiverId: article.author.id,
      isStart: !isLiked,
      articleId,
    });
    return !isLiked;
  }

  // 切换收藏文章
  async toggleFavoriteArticle(
    userId: number,
    articleId: number,
  ): Promise<boolean> {
    const articleExists = await this.articleRepo.exist({
      where: { id: articleId },
    });
    if (!articleExists) {
      throw new NotFoundException('文章不存在');
    }

    const existing = await this.favoriteRepo.findOne({
      where: { user: { id: userId }, article: { id: articleId } },
      relations: ['article', 'article.author'],
    });

    if (existing) {
      await this.favoriteRepo.remove(existing);
      if (userId === existing.article.author.id) return false;
      // 触发收藏通知
      this.eventEmitter.emit('notification.favorite', {
        senderId: userId,
        receiverId: existing.article.author.id,
        articleId,
        isStart: false,
      });
      return false;
    }

    const newFavorite = this.favoriteRepo.create({
      user: { id: userId },
      article: { id: articleId },
    });

    await this.favoriteRepo.save(newFavorite);

    // 获取完整文章信息用于通知
    const article = await this.articleRepo.findOne({
      where: { id: articleId },
      relations: ['author'],
    });
    if (!article) {
      throw new NotFoundException('文章不存在或已被删除');
    }

    if (userId === article.author.id) return true;
    // 触发收藏通知
    this.eventEmitter.emit('notification.favorite', {
      senderId: userId,
      receiverId: article.author.id,
      articleId,
      isStart: true,
    });

    return true;
  }

  // 获取文章，收藏，点赞，浏览量，作者粉丝数量
  async getArticleStats(articleId: number) {
    // 1. 验证文章存在并获取作者信息
    const article = await this.articleRepo.findOne({
      where: { id: articleId },
      relations: ['author', 'likedBy'],
    });
    if (!article) throw new NotFoundException('文章不存在');

    // 2. 并行查询所有统计数据
    const [authorFollowers, favoritesCount] = await Promise.all([
      // 作者粉丝数
      this.userRepo
        .createQueryBuilder('user')
        .innerJoin('user_following', 'uf', 'uf.follower_id = user.id')
        .where('uf.following_id = :authorId', { authorId: article.author.id })
        .getCount(),

      // 收藏数
      this.favoriteRepo.count({ where: { article: { id: articleId } } }),
    ]);

    return {
      authorFollowers,
      favoritesCount,
      likesCount: article.likedBy?.length || 0, // 点赞数（从关联关系获取）
      viewCount: article.viewCount || 0, // 浏览量
    };
  }
}
