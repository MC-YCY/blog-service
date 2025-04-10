import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationType } from './notification.entity';

@Injectable()
export class NotificationListener {
  constructor(
    private notificationService: NotificationService,
    private notificationGateway: NotificationGateway,
  ) {}

  @OnEvent('notification.follow')
  async handleFollowEvent(payload: {
    senderId: number;
    receiverId: number;
    isStart: boolean;
  }) {
    const notification = await this.notificationService.createNotification(
      NotificationType.FOLLOW,
      payload.senderId,
      payload.receiverId,
      payload.isStart,
    );
    this.notificationGateway.sendNotification(payload.receiverId, notification);
  }

  @OnEvent('notification.like')
  async handleLikeEvent(payload: {
    senderId: number;
    receiverId: number;
    isStart: boolean;
    articleId: number;
  }) {
    const notification = await this.notificationService.createNotification(
      NotificationType.LIKE,
      payload.senderId,
      payload.receiverId,
      payload.isStart,
      payload.articleId,
    );
    this.notificationGateway.sendNotification(payload.receiverId, notification);
  }

  @OnEvent('notification.favorite')
  async handleFavoriteEvent(payload: {
    senderId: number;
    receiverId: number;
    articleId: number;
    isStart: boolean;
  }) {
    const notification = await this.notificationService.createNotification(
      NotificationType.FAVORITE,
      payload.senderId,
      payload.receiverId,
      payload.isStart,
      payload.articleId,
    );
    this.notificationGateway.sendNotification(payload.receiverId, notification);
  }

  @OnEvent('notification.update')
  async handleUpdateEvent(payload: { userId: number }) {
    await this.notificationGateway.handleUpdateUnreadCount(payload.userId);
  }
}
