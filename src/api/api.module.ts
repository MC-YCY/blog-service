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
