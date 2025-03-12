// src/common/guards/jwt-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { RedisService } from '../service/redis.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检查是否为公共路由
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('缺少访问令牌');
    }

    try {
      // 验证 JWT
      const payload: Record<any, string> = await this.jwtService.verifyAsync(
        token,
        {
          secret: process.env.JWT_SECRET,
        },
      );

      // 检查 Redis 中是否存在有效令牌
      const isValid = await this.redisService.get(
        `access_token:${payload.userId}`,
      );
      if (!isValid) {
        throw new UnauthorizedException('令牌已失效');
      }

      // 将用户信息附加到请求对象
      request['user'] = payload;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('无效的访问令牌');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
