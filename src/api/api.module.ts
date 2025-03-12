import { Module } from '@nestjs/common';
import { RoleController } from './controller/role.controller';
import { ArticleController } from './controller/article.controller';
import { UserController } from './controller/user.controller';
import { CommentController } from './controller/comment.controller';
import { AuthController } from './controller/auth.controller';

@Module({
  controllers: [
    RoleController,
    ArticleController,
    UserController,
    CommentController,
    AuthController,
  ],
})
export class ApiModule {}
