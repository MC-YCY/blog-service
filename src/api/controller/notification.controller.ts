import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { NotificationService } from '../../notification/notification.service';
import { PaginateNotificationsDto } from '../../notification/notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('/info/:userId')
  async getNotifications(
    @Query() query: PaginateNotificationsDto,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.notificationService.getNotifications(userId, query);
  }

  @Get('/read/:id')
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.notificationService.markAsRead(id, userId);
  }
}
