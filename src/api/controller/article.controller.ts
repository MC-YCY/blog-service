import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { ArticleService } from '../../shared/service/article.service';
import {
  CreateArticleDto,
  PaginateArticleDto,
  UpdateArticleDto,
} from '../../shared/dto/article.dto';
import { Article } from '../../shared/entities/article.entity';
@Controller('users')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  // 创建文章
  @Post(':userId/articles')
  async createArticle(
    @Param('userId') userId: number,
    @Body() createArticleDto: CreateArticleDto,
  ): Promise<Article> {
    return this.articleService.create(+userId, createArticleDto);
  }

  // 根据用户分页查询文章
  @Get(':userId/articles')
  async paginateArticles(
    @Param('userId') userId: number,
    @Query() query: PaginateArticleDto,
  ) {
    return this.articleService.paginateByUser(+userId, query);
  }

  // 更新文章，文章 id 通过 query 参数传递
  @Put(':userId/articles')
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
  @Delete(':userId/articles')
  async deleteArticle(
    @Param('userId') userId: number,
    @Query('articleId') articleId: number,
  ): Promise<void> {
    return this.articleService.delete(+userId, +articleId);
  }

  @Get('all/articles')
  async getAll(@Query() query: PaginateArticleDto) {
    return this.articleService.searchApprovedByTitle(query);
  }
}
