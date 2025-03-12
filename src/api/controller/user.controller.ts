import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import {
  CreateUserDto,
  LoginUserDto,
  UpdateUserDto,
} from '../../shared/dto/user.dto';
import { UserService } from '../../shared/service/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    // 这里可以调用 AuthService 进行 JWT 登录验证
    return { message: '登录成功', user: loginUserDto };
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.userService.remove(id);
  }
}
