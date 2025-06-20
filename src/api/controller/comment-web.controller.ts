import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CommentWebService } from '../../shared/service/comment-web.service';
import { CreateCommentWebDto } from '../../shared/dto/create-comment-web.dto';
import { Public } from '../../shared/decorators/public.decorator';

@Public()
@Controller('comments-web')
export class CommentWebController {
  constructor(private readonly commentWebService: CommentWebService) {}

  // 创建评论
  @Post()
  async create(@Body() dto: CreateCommentWebDto) {
    return this.commentWebService.create(dto);
  }

  // 分页获取根评论（带子评论）
  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.commentWebService.findPaginated(+page, +limit);
  }
}
