import { Module } from '@nestjs/common';
import { RoleController } from './controller/role.controller';
import { ArticleController } from './controller/article.controller';
import { UserController } from './controller/user.controller';
import { CommentController } from './controller/comment.controller';
import { AuthController } from './controller/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DictController } from './controller/dict.controller';
import { PermissionController } from './controller/permission.controller';
import { MenuController } from './controller/menu.controller';
import { UploadController } from './controller/upload.controller';
import { ImageController } from './controller/image.controller';
import { ArticleUserController } from './controller/article-user.controller';
import { NotificationController } from './controller/notification.controller';
import { VisitController } from './controller/visit.controller';
import { MessagesController } from './controller/messages.controller';
import { DiaryController } from './controller/diary.controller';
import { CommentWebController } from './controller/comment-web.controller';
import { LinkController } from './controller/link.controller';

@Module({
  controllers: [
    RoleController,
    ArticleController,
    UserController,
    CommentController,
    AuthController,
    DictController,
    PermissionController,
    MenuController,
    UploadController,
    ImageController,
    ArticleUserController,
    NotificationController,
    VisitController,
    MessagesController,
    DiaryController,
    CommentWebController,
    LinkController,
  ],
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        return {
          secret: jwtSecret || 'fallback-secret', // Use fallback if undefined
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class ApiModule {}
