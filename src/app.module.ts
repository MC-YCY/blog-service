import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { SharedModule } from './shared/shared.module';
import { ApiModule } from './api/api.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    SharedModule,
    ApiModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, // 自动选择环境变量文件
      load: [databaseConfig],
      cache: true,
      expandVariables: true,
    }),
  ],
})
export class AppModule {}
