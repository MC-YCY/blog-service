import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as session from 'express-session';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService); // 获取 ConfigService
  const sessionSecret = configService.get('SESSION_SECRET'); // 获取 SESSION_SECRET
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
