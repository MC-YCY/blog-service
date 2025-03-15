// src/dict/dict.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Param,
  ConflictException,
  NotFoundException,
  Put,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DictService } from '../../shared/service/dict.service';
import { CreateDictDto, UpdateDictDto } from '../../shared/dto/dict.dto';

@ApiTags('字典管理')
@Controller('dicts')
export class DictController {
  constructor(private readonly dictService: DictService) {}

  @Post()
  @ApiOperation({ summary: '创建字典' })
  @ApiResponse({ status: 201, description: '字典创建成功' })
  @ApiResponse({ status: 409, description: '字典类型已存在' })
  async create(@Body() createDictDto: CreateDictDto) {
    try {
      return await this.dictService.create(createDictDto);
    } catch (error) {
      if (error instanceof Error && error?.message === '字典类型已存在') {
        throw new ConflictException(error?.message);
      }
      throw error;
    }
  }

  @Get('type/:type')
  @ApiOperation({ summary: '按类型查询字典' })
  @ApiParam({ name: 'type', description: '字典类型' })
  @ApiResponse({ status: 200, description: '返回对应字典' })
  @ApiResponse({ status: 404, description: '字典不存在' })
  async findByType(@Param('type') type: string) {
    const dict = await this.dictService.findByType(type);
    if (!dict) {
      throw new NotFoundException('字典不存在');
    }
    return dict;
  }

  @Get()
  @ApiOperation({ summary: '获取字典列表（分页）' })
  @ApiResponse({ status: 200, description: '返回分页字典列表' })
  async findAll(@Query('pageNo') page = 1, @Query('pageSize') pageSize = 10) {
    const result = await this.dictService.findAll(
      Number(page),
      Number(pageSize),
    );
    console.log(result);
    return result;
  }

  @Put(':id')
  @ApiOperation({ summary: '修改字典' })
  @ApiParam({ name: 'id', description: '字典ID' })
  @ApiResponse({ status: 200, description: '修改成功' })
  @ApiResponse({ status: 404, description: '字典不存在' })
  @ApiResponse({ status: 409, description: '类型冲突' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateDictDto) {
    return this.dictService.update(Number(id), updateDto);
  }

  // 对应在 Controller 中添加
  @Delete(':id')
  @ApiOperation({ summary: '删除字典' })
  @ApiParam({ name: 'id', description: '字典ID', type: Number })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '字典不存在' })
  async delete(@Param('id') id: string) {
    await this.dictService.delete(Number(id));
  }
}
