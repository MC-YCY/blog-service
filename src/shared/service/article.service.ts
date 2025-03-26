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
import { NotificationsGateway } from '../gateway/notifications.gateway';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationsGateway: NotificationsGateway, // 注入 WebSocket 网关
  ) {}

  // 创建文章
  async create(userId: number, createDto: CreateArticleDto): Promise<Article> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');

    // 设置默认状态
    const status = createDto.status || ArticleStatus.DRAFT;

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
  async searchApprovedByTitle(query: PaginateArticleDto) {
    const { title } = query;
    const { page = 1, limit = 10 } = query;

    const options: FindManyOptions<Article> = {
      where: {
        title: Like(`%${title}%`),
        status: ArticleStatus.PUBLISHED, // 请确认枚举中审核通过状态的名称
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
      const message = `您的文章 "${article.title}" 状态已更改为: ${updateDto.status}`;
      this.notificationsGateway.notifyAuthor(article.author.id, message);
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
  async paginateByUser(userId: number, query: PaginateArticleDto) {
    const { page = 1, limit = 10 } = query;

    const options: FindManyOptions<Article> = {
      where: { author: { id: userId } },
      relations: ['author'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    const [items, total] = await this.articleRepo.findAndCount(options);
    return { items, total };
  }
}
