import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' }, // 根据实际情况设置允许跨域
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection
{
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    // 假设客户端连接时通过 handshake.query 传递 userId 参数
    const userId = client.handshake.query.userId;
    if (userId) {
      // 将客户端加入对应用户的房间
      client.join(`user_${userId}`);
      console.log(`Client joined room user_${userId}`);
    }
  }

  /**
   * 向指定用户发送文章状态变更通知
   * @param authorId 文章作者的 ID
   * @param message 通知内容
   */
  notifyAuthor(authorId: number, message: string) {
    this.server
      .to(`user_${authorId}`)
      .emit('articleStatusChanged', { message });
  }
}
