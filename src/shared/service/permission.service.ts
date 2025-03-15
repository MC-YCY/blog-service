import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
} from '../dto/permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  // 创建权限
  async create(createDto: CreatePermissionDto): Promise<Permission | null> {
    try {
      // 检查 code 是否已存在
      const existing = await this.permissionRepository.findOneBy({
        code: createDto.code,
      });
      if (existing) {
        throw new ConflictException('权限标识符(code)已存在');
      }

      const permission = this.permissionRepository.create(createDto);
      return await this.permissionRepository.save(permission);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === '23505') {
        // PostgreSQL 唯一约束错误代码
        throw new ConflictException('权限标识符(code)已存在');
      }
      throw new BadRequestException('创建权限失败');
    }
  }

  // 分页查询
  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ records: Permission[]; total: number }> {
    if (page < 1) throw new BadRequestException('页码不能小于1');
    if (limit > 100) throw new BadRequestException('每页数量不能超过100');

    const [records, total] = await this.permissionRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'ASC' }, // 按ID排序
    });

    return { records, total };
  }

  // 根据ID查询
  async findById(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOneBy({ id });
    if (!permission) {
      throw new NotFoundException(`权限ID ${id} 不存在`);
    }
    return permission;
  }

  // 根据code查询
  async findByCode(code: string): Promise<Permission | null> {
    return this.permissionRepository.findOneBy({ code });
  }

  // 更新权限
  async update(
    id: number,
    updateDto: UpdatePermissionDto,
  ): Promise<Permission> {
    const permission = await this.findById(id);

    try {
      // 检查code是否重复
      if (updateDto.code && updateDto.code !== permission.code) {
        const existing = await this.findByCode(updateDto.code);
        if (existing) {
          throw new ConflictException('权限标识符(code)已存在');
        }
      }

      // 合并更新数据
      const updated = this.permissionRepository.merge(permission, updateDto);
      return await this.permissionRepository.save(updated);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === '23505') {
        throw new ConflictException('权限标识符(code)已存在');
      }
      throw new BadRequestException('更新权限失败');
    }
  }

  // 删除权限
  async delete(id: number): Promise<void> {
    const result = await this.permissionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`权限ID ${id} 不存在`);
    }
  }

  // 批量删除
  async deleteMany(ids: number[]): Promise<void> {
    const result = await this.permissionRepository
      .createQueryBuilder()
      .delete()
      .whereInIds(ids)
      .execute();

    if (result.affected !== ids.length) {
      throw new NotFoundException('部分权限ID不存在');
    }
  }
}
