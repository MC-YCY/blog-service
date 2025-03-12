import { Injectable } from '@nestjs/common';
import * as svgCaptcha from 'svg-captcha';

@Injectable()
export class CaptchaService {
  createCaptcha(req: any) {
    const captcha = svgCaptcha.create({
      size: 4,
      ignoreChars: '0o1iLl', // 增加易混淆字符过滤（如 1/L/l）
      noise: 4, // 适当增加干扰线数量
      color: true,
      background: '#f0f2f5', // 设置背景色提高可读性
    });

    req.session.captcha = captcha.text.toLowerCase();
    req.session.captchaGeneratedAt = Date.now(); // 记录生成时间
    return captcha.data;
  }

  verifyCaptcha(req: any, code: string) {
    const { captcha, captchaGeneratedAt } = req.session;
    if (!captcha || !captchaGeneratedAt) return false;

    // 验证码超时检查（例如 5 分钟）
    const isExpired = Date.now() - captchaGeneratedAt > 5 * 60 * 1000;
    if (isExpired) {
      delete req.session.captcha;
      delete req.session.captchaGeneratedAt;
      return false;
    }

    const isValid = code.toLowerCase() === captcha.toLowerCase();
    if (isValid) {
      // 验证通过后立即清除
      delete req.session.captcha;
      delete req.session.captchaGeneratedAt;
    }
    return isValid;
  }
}
