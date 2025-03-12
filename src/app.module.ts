import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    SharedModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, // 自动选择环境变量文件
      load: [databaseConfig],
    }),
  ],
})
export class AppModule {}
