import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from '../../shared/service/auth.service';
import { CaptchaService } from '../../shared/service/captcha.service';
import { LoginDto } from '../../shared/dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly captchaService: CaptchaService,
  ) {}

  @Get('captcha')
  getCaptcha(@Req() req: Request, @Res() res: Response) {
    const svg = this.captchaService.createCaptcha(req);
    res.type('svg');
    res.status(200).send(svg);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    // 1. 验证验证码
    if (!this.captchaService.verifyCaptcha(req, loginDto.code)) {
      throw new UnauthorizedException('验证码错误');
    }

    // 2. 验证用户凭证
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 3. 生成JWT
    return this.authService.login(user);
  }
}
