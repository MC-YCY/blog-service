import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  FindManyOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { Notification, NotificationType } from './notification.entity';
import {
  PaginatedNotificationsResult,
  PaginateNotificationsDto,
} from './notification.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private eventEmitter: EventEmitter2,
  ) {}

  async createNotification(
    type: NotificationType,
    senderId: number,
    receiverId: number,
    isStart: boolean,
    articleId?: number,
  ): Promise<Notification> {
    // 显式类型声明来帮助 TypeScript 推断
    const notificationData: DeepPartial<Notification> = {
      type,
      sender: { id: senderId },
      receiver: { id: receiverId },
      article: articleId ? { id: articleId } : undefined, // 使用 undefined 而不是 null
      isStart: isStart,
    };

    // 创建实体时显式类型转换
    const notification = this.notificationRepo.create(
      notificationData as DeepPartial<Notification>,
    );

    return await this.notificationRepo.save(notification);
  }

  async getNotifications(
    receiverId: number,
    query: PaginateNotificationsDto,
  ): Promise<PaginatedNotificationsResult> {
    const { page, limit, read } = query;
    if (!page || !limit || !receiverId) {
      throw new NotFoundException('page not found');
    }
    const skip = (page - 1) * limit;

    // 显式声明查询条件类型
    // const baseWhere: FindOptionsWhere<Notification> = {
    //   receiver: { id: receiverId },
    // };
    const baseWhere: FindOptionsWhere<Notification> = {
      receiver: { id: receiverId },
    };
    if (read) {
      baseWhere['read'] = { '1': true, '0': false }[read];
    }

    // 分页查询配置
    const findOptions: FindManyOptions<Notification> = {
      where: baseWhere,
      order: { createdAt: 'DESC' },
      relations: ['sender', 'article'],
      skip,
      take: limit,
    };

    // 并行查询（修正 count 参数类型）
    const [items, total, unreadCount] = await Promise.all([
      this.notificationRepo.find(findOptions),
      this.notificationRepo.count({ where: baseWhere }),
      this.notificationRepo.count({
        where: {
          ...baseWhere,
          read: false,
        },
      }),
    ]);

    return { items, total, unreadCount };
  }

  async markAsRead(
    notificationId: number,
    userId: number,
    read: boolean = true,
  ): Promise<Notification> {
    const updateResult = await this.notificationRepo.update(
      {
        id: notificationId,
        receiver: { id: userId },
      },
      { read },
    );

    if (updateResult.affected === 0) {
      throw new NotFoundException('通知不存在或无权操作');
    }

    const result = await this.notificationRepo.findOne({
      where: { id: notificationId },
      relations: ['sender', 'article'],
    });

    if (!result) {
      throw new NotFoundException('消息不存在');
    }
    this.eventEmitter.emit('notification.update', {
      userId: userId,
    });
    return result;
  }
}
