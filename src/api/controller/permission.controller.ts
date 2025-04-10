import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PermissionService } from 'src/shared/service/permission.service';
import { Permission } from '../../shared/entities/permission.entity';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
} from '../../shared/dto/permission.dto';

@ApiTags('权限管理')
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @ApiOperation({ summary: '创建新权限', description: '创建一个新的系统权限' })
  @ApiCreatedResponse({ type: Permission, description: '权限创建成功' })
  @ApiConflictResponse({ description: '权限标识符(code)已存在' })
  @ApiBadRequestResponse({ description: '无效的请求参数' })
  async create(
    @Body() createDto: CreatePermissionDto,
  ): Promise<Permission | null> {
    return this.permissionService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: '分页查询权限', description: '获取权限分页列表' })
  @ApiQuery({
    name: 'pageNo',
    required: false,
    example: 1,
    description: '页码',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    example: 10,
    description: '每页数量',
  })
  @ApiOkResponse({
    type: [Permission],
    description: '获取权限列表成功',
  })
  async findAll(
    @Query('pageNo', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return this.permissionService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({
    summary: '获取权限详情',
    description: '通过ID获取权限详细信息',
  })
  @ApiOkResponse({ type: Permission, description: '权限详情' })
  @ApiNotFoundResponse({ description: '权限不存在' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Permission> {
    return this.permissionService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: '更新权限信息',
    description: '更新指定权限的详细信息',
  })
  @ApiOkResponse({ type: Permission, description: '权限更新成功' })
  @ApiNotFoundResponse({ description: '权限不存在' })
  @ApiConflictResponse({ description: '权限标识符(code)已存在' })
  @ApiBody({ type: UpdatePermissionDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePermissionDto,
  ): Promise<Permission> {
    return this.permissionService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除权限', description: '删除指定的权限' })
  @ApiOkResponse({ description: '权限删除成功' })
  @ApiNotFoundResponse({ description: '权限不存在' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.permissionService.delete(id);
  }

  @Post('batch-delete')
  @ApiOperation({ summary: '批量删除权限', description: '批量删除多个权限' })
  @ApiBody({
    description: '需要删除的权限ID数组',
    type: [Number],
    examples: {
      example: {
        value: { ids: [1, 2, 3] },
      },
    },
  })
  @ApiOkResponse({ description: '批量删除成功' })
  @ApiNotFoundResponse({ description: '部分权限不存在' })
  async deleteMany(
    @Body('ids', new ParseArrayPipe({ items: Number })) ids: number[],
  ): Promise<void> {
    return this.permissionService.deleteMany(ids);
  }
}
