import {
  Controller,
  Post,
  Body,
  Get,
  UnauthorizedException,
  BadRequestException,
  Req,
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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    await this.validateCaptcha(
      createUserDto.captchaId,
      createUserDto.captchaCode,
    );
    const user = await this.userService.create(createUserDto);
    return { message: '注册成功', user };
  }

  @Public()
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    await this.validateCaptcha(
      loginUserDto.captchaId,
      loginUserDto.captchaCode,
    );

    const { account, password } = loginUserDto;
    const user = await this.userService.findByAccount(account);

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const accessToken = this.jwtService.sign(
      { userId: user.id, account: user.account },
      { expiresIn: '1h' },
    );
    const refreshToken = this.jwtService.sign(
      { userId: user.id, account: user.account },
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
    await this.redisService.set(
      `token:${accessToken}:role`, // 以 Token 为键存储角色
      user.role.code,
      60 * 60, // 与 access_token 过期时间一致
    );
    const userVo = new UserVo();
    userVo.account = user.account;
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
        { userId: decoded.userId, account: decoded.account },
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

  @Public()
  @Post('logout')
  async logout(@Body('userId') userId: number) {
    await this.redisService.del(`access_token:${userId}`);
    await this.redisService.del(`refresh_token:${userId}`);
    return { message: '登出成功' };
  }

  @Public()
  @Get('captcha')
  async generateCaptcha() {
    const captcha = svgCaptcha.create({
      size: 4,
      ignoreChars: '0o1iIl',
      noise: 3,
      color: true,
    });
    const captchaId = uuidv4();
    console.log(captcha.text);
    console.log(captchaId);

    await this.redisService.set(
      `captcha:${captchaId}`,
      captcha.text.toLowerCase(),
      5 * 60,
    );

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
      throw new BadRequestException('验证码错误');
    }

    await this.redisService.del(`captcha:${captchaId}`);
  }
}
