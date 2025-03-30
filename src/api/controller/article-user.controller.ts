import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  NotFoundException,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import { ArticleService } from '../../shared/service/article.service';
import { Public } from '../../shared/decorators/public.decorator';

@Controller('articles-user')
export class ArticleUserController {
  constructor(private readonly articleService: ArticleService) {}

  // 获取用户与文章的交互状态
  @Get(':articleId/interaction')
  async getArticleInteraction(
    @Query('userId') userId: number, // 从查询参数获取 userId
    @Param('articleId') articleId: number,
  ) {
    try {
      return await this.articleService.getArticleInteractionStatus(
        userId,
        articleId,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  // 切换关注作者
  @Post('follow-author')
  async toggleFollow(
    @Body('authorId') authorId: number,
    @Body('userId') userId: number,
  ) {
    try {
      return {
        success: true,
        result: await this.articleService.toggleFollowAuthor(userId, authorId),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ForbiddenException) {
        throw new ForbiddenException(error.message);
      }
      throw error;
    }
  }

  // 切换喜欢文章
  @Post('like-article')
  async toggleLike(
    @Body('articleId') articleId: number,
    @Body('userId') userId: number,
  ) {
    try {
      return {
        success: true,
        result: await this.articleService.toggleLikeArticle(userId, articleId),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ForbiddenException) {
        throw new ForbiddenException(error.message);
      }
      throw error;
    }
  }

  // 切换收藏文章
  @Post('favorite-article')
  async toggleFavorite(
    @Body('articleId') articleId: number,
    @Body('userId') userId: number,
  ) {
    try {
      return {
        success: true,
        result: await this.articleService.toggleFavoriteArticle(
          userId,
          articleId,
        ),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Public()
  @Post('stats-article')
  async getArticleStats(@Body('articleId', ParseIntPipe) id: number) {
    return this.articleService.getArticleStats(id);
  }
}
