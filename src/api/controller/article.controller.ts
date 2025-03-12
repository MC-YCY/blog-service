import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ArticleService } from '../../shared/service/article.service';
import {
  CreateArticleDto,
  LikeArticleDto,
  UpdateArticleDto,
} from '../../shared/dto/article.dto';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articleService.create(createArticleDto);
  }

  @Get()
  findAll() {
    return this.articleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.articleService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articleService.update(id, updateArticleDto);
  }

  @Post('like')
  likeArticle(@Body() likeArticleDto: LikeArticleDto) {
    return this.articleService.likeArticle(likeArticleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.articleService.remove(id);
  }
}
