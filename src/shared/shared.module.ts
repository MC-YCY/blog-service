import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { User } from './entity/user.entity';
import { Role } from './entity/role.entity';
import { Article } from './entity/article.entity';

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
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV !== 'production', // 生产环境不要自动同步数据库
        entities: [User, Role, Article, Comment],
      }),
    }),
  ],
})
export class SharedModule {}
