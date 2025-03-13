// src/dict/dict.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDictDto } from '../dto/dict.dto';
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
  async findAll(page = 1, pageSize = 10): Promise<[Dict[], number]> {
    return this.dictRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { sort: 'ASC' },
    });
  }
}
