// src/dict/dict.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDictDto, UpdateDictDto } from '../dto/dict.dto';
import { Dict } from '../entities/dict.entity';

@Injectable()
export class DictService {
  constructor(
    @InjectRepository(Dict)
    private dictRepository: Repository<Dict>,
  ) {}

  // 创建字典
  async create(createDto: CreateDictDto): Promise<Dict> {
    const existing = await this.dictRepository.findOne({
      where: { type: createDto.type },
    });
    if (existing) throw new Error('字典类型已存在');

    return this.dictRepository.save(createDto);
  }

  // 按类型查找字典
  async findByType(type: string): Promise<Dict | null> {
    return this.dictRepository.findOne({
      where: { type, status: true },
    });
  }

  // 获取所有字典（带分页）
  async findAll(
    page = 1,
    pageSize = 10,
  ): Promise<{ records: Dict[]; total: number }> {
    const [records, total] = await this.dictRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { sort: 'ASC' },
    });

    return {
      records,
      total, // 返回总记录数用于前端分页计算
    };
  }

  async findEntriesByType(
    type: string,
    page = 1,
    pageSize = 10,
  ): Promise<{
    records: Array<{ label: string; value: string | number }>;
    total: number;
  }> {
    const dict = await this.dictRepository.findOne({
      where: { type, status: true },
      select: ['entries'], // 只查询 entries 字段
    });

    if (!dict) throw new NotFoundException('字典不存在或已禁用');

    // 应用层分页
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      records: dict.entries?.slice(start, end) || [],
      total: dict.entries.length,
    };
  }

  async update(id: number, updateDto: UpdateDictDto): Promise<Dict> {
    const dict = await this.dictRepository.findOneBy({ id });
    if (!dict) throw new NotFoundException('字典不存在');

    // 如果修改了 type 需要检查唯一性
    if (updateDto.type && updateDto.type !== dict.type) {
      const existing = await this.dictRepository.findOne({
        where: { type: updateDto.type },
      });
      if (existing) throw new ConflictException('字典类型已存在');
    }

    return this.dictRepository.save({
      ...dict,
      ...updateDto,
    });
  }

  /**
   * 删除字典
   * @param id 字典ID
   */
  async delete(id: number): Promise<void> {
    const result = await this.dictRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('字典不存在');
    }
  }
}
