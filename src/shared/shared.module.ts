import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Global, Module } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Article } from './entities/article.entity';
import { Comment } from './entities/comment.entity';
import { RoleService } from './service/role.service';
import { UserService } from './service/user.service';
import { ArticleService } from './service/article.service';
import { CommentService } from './service/comment.service';
import { RedisService } from './service/redis.service';
import { JwtService } from '@nestjs/jwt';
import { Permission } from './entities/permission.entity';
import { PermissionService } from './service/permission.service';
import { Dict } from './entities/dict.entity';
import { DictService } from './service/dict.service';
import { Menu } from './entities/menu.entity';
import { MenuService } from './service/menu.service';
import { Image } from './entities/image.entity';
import { ImageService } from './service/image.service';
import { Favorite } from './entities/favorite.entity';
import { Notification } from '../notification/notification.entity';
import { NotificationService } from '../notification/notification.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationGateway } from '../notification/notification.gateway';
import { NotificationListener } from '../notification/notification.listener';
import { Visit } from './entities/visit.entity';
import { VisitService } from './service/visit.service';
import { MessagesService } from './service/messages.service';
import { Message } from './entities/messages.entity';
import { Diary } from './entities/diary.entity';
import { DiaryService } from './service/diary.service';
import { CommentWeb } from './entities/comment-web.entity';
import { CommentWebService } from './service/comment-web.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        charset: 'utf8mb4',
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
    EventEmitterModule.forRoot(),
    TypeOrmModule.forFeature([
      User,
      Role,
      Article,
      Comment,
      Permission,
      Dict,
      Menu,
      Image,
      Favorite,
      Notification,
      Visit,
      Message,
      Diary,
      CommentWeb,
    ]),
  ],
  exports: [
    RoleService,
    UserService,
    ArticleService,
    CommentService,
    RedisService,
    JwtService,
    PermissionService,
    DictService,
    MenuService,
    ImageService,
    NotificationService,
    NotificationListener,
    NotificationGateway,
    VisitService,
    MessagesService,
    DiaryService,
    CommentWebService,
  ],
  providers: [
    RoleService,
    UserService,
    ArticleService,
    CommentService,
    RedisService,
    JwtService,
    PermissionService,
    DictService,
    MenuService,
    ImageService,
    NotificationService,
    NotificationListener,
    NotificationGateway,
    VisitService,
    MessagesService,
    DiaryService,
    CommentWebService,
  ],
})
export class SharedModule {}
