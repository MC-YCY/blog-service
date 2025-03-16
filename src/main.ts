import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';

import * as session from 'express-session';
import { ConfigService } from '@nestjs/config';
import { ResponseInterceptor } from './shared/interceptor/response.interceptor';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from './shared/service/redis.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 前缀
  app.setGlobalPrefix('blog');
  // 全局响应拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());
  // 异常过滤器，同权限添加的
  app.useGlobalFilters(new HttpExceptionFilter());

  // token 验证的
  app.useGlobalGuards(
    new JwtAuthGuard(
      app.get(Reflector),
      app.get(JwtService),
      app.get(RedisService),
    ),
  );

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

  const config = new DocumentBuilder()
    .setTitle('API 文档')
    .setDescription('系统接口文档')
    .setVersion('1.0')
    .addBearerAuth() // 启用 Bearer Token 认证
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // 访问路径为 /api

  // 调整请求体限制为1.5MB（考虑JSON元数据）
  app.use(json({ limit: '1.5mb' }));
  app.use(urlencoded({ extended: true, limit: '1.5mb' }));

  await app.listen(3000);
}

bootstrap();
