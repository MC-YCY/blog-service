import 'express-session'; // 确保导入 express-session 模块

declare module 'express-session' {
  interface SessionData {
    captcha: string;
    captchaGeneratedAt: number;
  }
}
