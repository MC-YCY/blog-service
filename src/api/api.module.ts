import { Module } from '@nestjs/common';
import { RoleController } from './controller/role.controller';
import { ArticleController } from './controller/article.controller';
import { UserController } from './controller/user.controller';
import { CommentController } from './controller/comment.controller';
import { AuthController } from './controller/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  controllers: [
    RoleController,
    ArticleController,
    UserController,
    CommentController,
    AuthController,
  ],
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        console.log('JWT_SECRET:', jwtSecret); // Log to check if it is loading correctly
        return {
          secret: jwtSecret || 'fallback-secret', // Use fallback if undefined
          signOptions: { expiresIn: '1h' },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class ApiModule {}
