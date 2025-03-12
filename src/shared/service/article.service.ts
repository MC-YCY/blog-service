import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../entities/article.entity';
import {
  CreateArticleDto,
  UpdateArticleDto,
  LikeArticleDto,
} from '../dto/article.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const article = this.articleRepository.create(createArticleDto);
    return await this.articleRepository.save(article);
  }

  async findAll(): Promise<Article[]> {
    return await this.articleRepository.find({
      relations: ['author', 'likedBy', 'comments'],
    });
  }

  async findOne(id: number): Promise<Article | null> {
    return await this.articleRepository.findOne({
      where: { id },
      relations: ['author', 'likedBy', 'comments'],
    });
  }

  async update(
    id: number,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article | null> {
    await this.articleRepository.update(id, updateArticleDto);
    return this.findOne(id);
  }

  async likeArticle(likeArticleDto: LikeArticleDto): Promise<void> {
    const { userId, articleId } = likeArticleDto;
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['likedArticles'],
    });
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
    });

    if (!user || !article) {
      throw new Error('User or Article not found');
    }

    user.likedArticles.push(article);
    await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.articleRepository.delete(id);
  }
}
