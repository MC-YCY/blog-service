import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Notification } from './notification.entity';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './notification.service';
import { UnauthorizedException } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly notificationService: NotificationService) {}
  @WebSocketServer()
  server: Server;

  private userConnections = new Map<number, string>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    if (userId) {
      this.userConnections.set(Number(userId), client.id);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = [...this.userConnections.entries()].find(
      ([, socketId]) => socketId === client.id,
    )?.[0];
    if (userId) {
      this.userConnections.delete(userId);
    }
  }

  sendNotification(userId: number, notification: Notification) {
    const socketId = this.userConnections.get(Number(userId));
    if (socketId) {
      this.server.to(socketId).emit('new-notification', notification);
    }
  }

  @SubscribeMessage('get-unread-count')
  async handleGetUnreadCount(client: Socket) {
    const userId = client.handshake.query.userId;
    if (!userId) {
      throw new UnauthorizedException('Not authorized');
    }
    const { unreadCount } = await this.notificationService.getNotifications(
      Number(userId),
      {
        page: 1,
        limit: 1,
      },
    );
    client.emit('unread-count', unreadCount);
  }

  async handleUpdateUnreadCount(userId: number) {
    if (!userId) {
      throw new UnauthorizedException('Not authorized');
    }
    const { unreadCount } = await this.notificationService.getNotifications(
      Number(userId),
      {
        page: 1,
        limit: 1,
      },
    );
    const socketId = this.userConnections.get(Number(userId));
    if (socketId) {
      this.server.to(socketId).emit('updated-unread-count', unreadCount);
    }
  }
}
