import {
  Controller,
  Post,
  Body,
  Get,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from '../../shared/service/user.service';
import { LoginUserDto, CreateUserDto } from '../../shared/dto/user.dto';
import { RedisService } from '../../shared/service/redis.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserVo } from '../../shared/vo/user.vo';
import { Public } from '../../shared/decorators/public.decorator';
import * as svgCaptcha from 'svg-captcha';
import { v4 as uuidv4 } from 'uuid';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    await this.validateCaptcha(
      createUserDto.captchaId,
      createUserDto.captchaCode,
    );
    const user = await this.userService.create(createUserDto);
    return { message: '注册成功', user };
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    await this.validateCaptcha(
      loginUserDto.captchaId,
      loginUserDto.captchaCode,
    );

    const { username, password } = loginUserDto;
    const user = await this.userService.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const accessToken = this.jwtService.sign(
      { userId: user.id, username: user.username },
      { expiresIn: '1h' },
    );
    const refreshToken = this.jwtService.sign(
      { userId: user.id, username: user.username },
      { expiresIn: '7d' },
    );
    // 将令牌存储在Redis中
    await this.redisService.set(
      `access_token:${user.id}`,
      accessToken,
      60 * 60, // 1小时过期
    );
    await this.redisService.set(
      `refresh_token:${user.id}`,
      refreshToken,
      7 * 24 * 60 * 60, // 7天过期
    );
    const userVo = new UserVo();
    userVo.username = user.username;
    userVo.id = user.id;
    userVo.role = user.role;
    userVo.avatar = user.avatar;

    return {
      message: '登录成功',
      access_token: accessToken,
      refresh_token: refreshToken,
      user: userVo,
    };
  }

  @Post('refresh')
  async refresh(@Body('refresh_token') refreshToken: string) {
    try {
      const decoded: Record<any, string> = this.jwtService.verify(refreshToken);
      const storedToken = await this.redisService.get(
        `refresh_token:${decoded.userId}`,
      );

      if (!storedToken || storedToken !== refreshToken) {
        throw new BadRequestException('无效的刷新令牌');
      }

      const newAccessToken = this.jwtService.sign(
        { userId: decoded.userId, username: decoded.username },
        { expiresIn: '1h' },
      );

      await this.redisService.set(
        `access_token:${decoded.userId}`,
        newAccessToken,
        60 * 60,
      );

      return {
        access_token: newAccessToken,
      };
    } catch (err) {
      console.log(err);
      throw new BadRequestException('无效的刷新令牌');
    }
  }

  @Post('logout')
  async logout(@Body('userId') userId: number) {
    await this.redisService.del(`access_token:${userId}`);
    await this.redisService.del(`refresh_token:${userId}`);
    return { message: '登出成功' };
  }

  @Get('captcha')
  async generateCaptcha() {
    // 生成验证码
    const captcha = svgCaptcha.create({
      size: 6,
      ignoreChars: '0o1iIl', // 排除易混淆字符
      noise: 3, // 干扰线数量
      color: true, // 彩色验证码
      background: '#f0f2f5', // 背景颜色
    });

    // 生成唯一验证码 ID
    const captchaId = uuidv4();

    // 存储到 Redis（5分钟过期）
    await this.redisService.set(
      `captcha:${captchaId}`,
      captcha.text.toLowerCase(), // 统一转小写存储
      5 * 60,
    );

    // 返回 SVG 和验证码 ID
    return {
      captchaId,
      svg: captcha.data,
    };
  }
  private async validateCaptcha(captchaId: string, code: string) {
    if (!captchaId || !code) {
      throw new BadRequestException('验证码不能为空');
    }

    const storedCode = await this.redisService.get(`captcha:${captchaId}`);
    if (!storedCode) {
      throw new BadRequestException('验证码已过期');
    }

    if (storedCode !== code.toLowerCase()) {
      // 统一转小写比较
      throw new BadRequestException('验证码错误');
    }

    // 验证成功后删除 Redis 中的验证码（防止重复使用）
    await this.redisService.del(`captcha:${captchaId}`);
  }
}
