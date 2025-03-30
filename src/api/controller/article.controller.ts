import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Query,
  Put,
  Delete,
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { ArticleService } from '../../shared/service/article.service';
import {
  CreateArticleDto,
  PaginateArticleDto,
  UpdateArticleDto,
} from '../../shared/dto/article.dto';
import { Article } from '../../shared/entities/article.entity';
import { Public } from '../../shared/decorators/public.decorator';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  // 创建文章
  @Post(':userId')
  async createArticle(
    @Param('userId') userId: number,
    @Body() createArticleDto: CreateArticleDto,
  ): Promise<Article> {
    return this.articleService.create(+userId, createArticleDto);
  }

  // 根据用户分页查询文章
  @Public()
  @Get('user/:userId')
  async paginateArticles(
    @Param('userId') userId: number,
    @Query() query: PaginateArticleDto,
    @Query('isLoginUser', ParseBoolPipe) isLoginUser: boolean,
  ) {
    return this.articleService.paginateByUser(+userId, query, isLoginUser);
  }

  // 更新文章，文章 id 通过 query 参数传递
  @Put(':userId')
  async updateArticle(
    @Param('userId') userId: number,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    return this.articleService.update(
      +userId,
      updateArticleDto.articleId,
      updateArticleDto,
    );
  }

  // 删除文章，文章 id 通过 query 参数传递
  @Delete(':userId')
  async deleteArticle(
    @Param('userId') userId: number,
    @Query('articleId') articleId: number,
  ): Promise<void> {
    return this.articleService.delete(+userId, +articleId);
  }

  @Public()
  @Get('all')
  async getAll(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('title') title: string,
    @Query('tag') tag: string,
  ) {
    return this.articleService.searchApprovedByTitle(page, limit, title, tag);
  }

  @Public()
  @Get('item/:articleId')
  async getArticle(
    @Param('articleId', ParseIntPipe) articleId: number,
  ): Promise<Article> {
    return this.articleService.findOne(articleId);
  }

  @Public()
  @Get('timeline')
  async getTimelineArticles(): Promise<{ date: string; posts: Article[] }[]> {
    return await this.articleService.getLatestArticlesGroupedByDate();
  }
}
