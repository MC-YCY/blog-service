import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.redis.on('error', (error) => {
      console.error('Redis连接错误:', error);
    });
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      console.error('Redis获取数据错误:', error);
      throw error;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<'OK' | null> {
    try {
      if (ttl) {
        return await this.redis.set(key, value, 'EX', ttl);
      }
      return await this.redis.set(key, value);
    } catch (error) {
      console.error('Redis设置数据错误:', error);
      throw error;
    }
  }

  async del(key: string): Promise<number> {
    try {
      return await this.redis.del(key);
    } catch (error) {
      console.error('Redis删除数据错误:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
