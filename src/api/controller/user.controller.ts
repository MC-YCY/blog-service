import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  PaginationDto,
  UpdateUserDto,
} from '../../shared/dto/user.dto';
import { UserService } from '../../shared/service/user.service';
import { ApiTags, ApiQuery, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { User } from '../../shared/entities/user.entity';
import { UpdateRoleDto } from '../../shared/dto/role.dto';
import { Public } from '../../shared/decorators/public.decorator';

@ApiTags('用户管理')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: '分页获取用户列表' })
  @ApiQuery({ name: 'pageNo', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: '返回用户分页列表',
    schema: {
      example: {
        records: [
          {
            id: 1,
            username: 'user1',
            role: { id: 1, name: 'Admin' },
          },
        ],
        total: 100,
      },
    },
  })
  findAll(
    @Query('pageNo', ParseIntPipe) page: number = 1,
    @Query('pageSize', ParseIntPipe) limit: number = 10,
  ) {
    return this.userService.findAll(page, limit);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '根据 ID 获取用户详情' })
  @ApiResponse({ status: 200, description: '返回用户详情', type: User })
  findOne(@Param('id') id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiResponse({ status: 200, description: '用户更新成功', type: User })
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({ status: 200, description: '用户删除成功' })
  remove(@Param('id') id: number) {
    return this.userService.remove(id);
  }

  @Post('update/:id/role')
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.userService.updateUserRole(id, dto.id);
  }

  @Public()
  @Post('following/:id')
  async getFollowingUsers(
    @Param('id', ParseIntPipe) id: number,
    @Body() paginationDto: PaginationDto,
  ) {
    return this.userService.getFollowingUsers(id, paginationDto);
  }

  @Public()
  @Post('liked/:id')
  async getLikedArticles(
    @Param('id', ParseIntPipe) id: number,
    @Body() paginationDto: PaginationDto,
  ) {
    return this.userService.getLikedArticles(id, paginationDto);
  }

  @Public()
  @Post('favorite/:id')
  async getFavoriteArticles(
    @Param('id', ParseIntPipe) id: number,
    @Body() paginationDto: PaginationDto,
  ) {
    return this.userService.getFavoriteArticles(id, paginationDto);
  }

  @Public()
  @Post('followers/:userId')
  async getFollowers(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() paginationDto: PaginationDto,
  ) {
    return this.userService.getFollowers(userId, paginationDto);
  }

  @Public()
  @Post('user-stats/:userId')
  async getUserStats(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.getUserStats(userId);
  }

  @Public()
  @Post('/is-follower')
  async isFollower(
    @Body('userId', ParseIntPipe) userId: number,
    @Body('targetUserId', ParseIntPipe) targetUserId: number,
  ) {
    return await this.userService.isFollowing(userId, targetUserId);
  }
}
