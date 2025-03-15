import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { SharedModule } from './shared/shared.module';
import { ApiModule } from './api/api.module';

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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {

  }
}
