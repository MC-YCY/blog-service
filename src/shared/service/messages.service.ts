import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/messages.entity';
import { CreateMessageDto } from '../dto/messages.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  // 创建新消息
  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messageRepository.create({
      ...createMessageDto,
      date: new Date(), // 确保使用服务器时间
    });
    return this.messageRepository.save(message);
  }

  // 查询所有消息（带分页）
  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Message[]; total: number }> {
    const [data, total] = await this.messageRepository.findAndCount({
      order: { date: 'DESC' }, // 按时间倒序
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  // 可选：按用户查询消息
  async findByUsername(username: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: { username },
      order: { date: 'DESC' },
    });
  }
}
