import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as session from 'express-session';
import { ConfigService } from '@nestjs/config';
import { ResponseInterceptor } from './shared/interceptor/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('blog');
  // 全局响应拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());

  const configService = app.get(ConfigService); // 获取 ConfigService
  const sessionSecret: string = configService.get('SESSION_SECRET') ?? ''; // 获取 SESSION_SECRET
  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 5, // 5分钟
      },
    }),
  );

  await app.listen(3000);
}

bootstrap();
