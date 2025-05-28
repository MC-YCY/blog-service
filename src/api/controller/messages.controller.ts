import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { MessagesService } from '../../shared/service/messages.service';
import { CreateMessageDto } from '../../shared/dto/messages.dto';
import { Message } from '../../shared/entities/messages.entity';
import { Public } from '../../shared/decorators/public.decorator';

@Public()
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(@Body() createMessageDto: CreateMessageDto): Promise<Message> {
    return this.messagesService.create(createMessageDto);
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: Message[]; total: number }> {
    return this.messagesService.findAll(page, limit);
  }
}
