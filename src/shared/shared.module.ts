import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Global, Module } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Article } from './entities/article.entity';
import { Comment } from './entities/comment.entity';
import { CaptchaService } from './service/captcha.service';
import { RoleService } from './service/role.service';
import { UserService } from './service/user.service';
import { ArticleService } from './service/article.service';
import { CommentService } from './service/comment.service';
import { RedisService } from './service/redis.service';
import { JwtService } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.user'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        autoLoadEntities: true, // 自动加载所有的实体
        logging: true, //输出内部真正sql语句
        synchronize: process.env.NODE_ENV !== 'production', // 生产环境不要自动同步数据库
      }),
    }),
    TypeOrmModule.forFeature([User, Role, Article, Comment]),
  ],
  exports: [
    RoleService,
    UserService,
    ArticleService,
    CommentService,
    CaptchaService,
    RedisService,
    JwtService,
  ],
  providers: [
    RoleService,
    UserService,
    ArticleService,
    CommentService,
    CaptchaService,
    RedisService,
    JwtService,
  ],
})
export class SharedModule {}
