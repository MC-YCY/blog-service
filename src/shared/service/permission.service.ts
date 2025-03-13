import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto } from '../dto/permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createDto: CreatePermissionDto): Promise<Permission> {
    try {
      const permission = this.permissionRepository.create(createDto);
      return await this.permissionRepository.save(permission);
    } catch (error) {
      if (error.code === '23505') {
        // PostgreSQL 唯一约束错误代码
        throw new ConflictException('权限标识符(code)已存在');
      }
      throw error;
    }
  }

  // 可选的其他方法
  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  async findByCode(code: string): Promise<Permission | null> {
    return this.permissionRepository.findOneBy({ code });
  }
}
