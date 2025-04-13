// comment.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CreateCommentDto } from '../../shared/dto/comment.dto';
import { CommentService } from '../../shared/service/comment.service';

@Controller('comments')
export class CommentController {
  constructor(private commentService: CommentService) {}
  @Post()
  async createComment(@Body() createCommentDto: CreateCommentDto) {
    const comment = await this.commentService.createComment(createCommentDto);
    return comment;
  }

  @Get()
  async getComments(@Query('articleId') articleId: number) {
    if (!articleId) {
      throw new NotFoundException('articleId is required');
    }
    const comments = await this.commentService.getCommentsByArticle(articleId);
    return { success: true, data: comments };
  }

  @Delete(':id')
  async deleteComment(@Param('id') id: number) {
    await this.commentService.deleteComment(id);
    return { success: true };
  }
}
