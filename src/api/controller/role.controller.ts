import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Delete,
  ParseIntPipe,
  Put,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RoleService } from '../../shared/service/role.service';
import {
  CreateRoleDto,
  RoleUsersPaginationDto,
  UpdateRoleDto,
} from '../../shared/dto/role.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('roles')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: '创建角色' })
  @ApiResponse({ status: 201, description: '角色创建成功' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: '分页查询角色' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '当前页码，默认值为1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '每页显示的条数，默认值为10',
  })
  @ApiResponse({
    status: 200,
    description: '返回分页数据，格式为 { records, total }',
  })
  findAll(
    @Query('pageNo') pageNo: string,
    @Query('pageSize') pageSize: string,
    @Query('name') name?: string,
  ) {
    const pageNumber = Number(pageNo) || 1;
    const limitNumber = Number(pageSize) || 10;
    return this.roleService.findAll(pageNumber, limitNumber, name);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询角色' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findOne(@Param('id') id: number) {
    return this.roleService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '根据ID删除角色' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.delete(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新角色信息' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Get(':id/users')
  async getRoleWithUsers(
    @Param('id') id: number,
    @Query() query: RoleUsersPaginationDto,
  ) {
    try {
      return await this.roleService.findRoleUsers(
        id,
        query.page,
        query.limit,
        query.orderBy,
        query.order,
      );
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new BadRequestException(e.message);
    }
  }

  @Get(':id/permissions')
  async getRoleWithPermissions(@Param('id') id: number) {
    const role = await this.roleService.findRolePermissions(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  @Put(':id/permissions')
  async updateRolePermissions(
    @Param('id') id: number,
    @Body() body: { permissionIds: number[] },
  ) {
    return this.roleService.updateRolePermissions(id, body.permissionIds);
  }
}
