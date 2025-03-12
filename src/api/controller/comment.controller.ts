import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { CommentService } from '../../shared/service/comment.service';
import { CreateCommentDto } from '../../shared/dto/comment.dto';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentService.create(createCommentDto);
  }

  @Get()
  findAll() {
    return this.commentService.findAll();
  }

  @Get('article/:articleId')
  findByArticle(@Param('articleId') articleId: number) {
    return this.commentService.findByArticle(articleId);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.commentService.remove(id);
  }
}
