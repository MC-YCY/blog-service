import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import {
  AssignResourcesDto,
  CreateRoleDto,
  UpdateRoleDto,
} from '../dto/role.dto';
import { Menu } from '../entities/menu.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,

    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(role);
  }

  /**
   * 分页查询角色数据
   * @param page 当前页码，默认为 1
   * @param limit 每页显示条数，默认为 10
   * @param name
   * @returns 返回 {records, total} 格式数据
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    name?: string, // 新增可选名称参数
  ): Promise<{ records: Role[]; total: number }> {
    // 构建动态查询条件
    const where: Record<string, any> = {};

    if (name) {
      where.name = Like(`%${name}%`); // 模糊查询
    }

    const [records, total] = await this.roleRepository.findAndCount({
      where, // 注入查询条件
      skip: (page - 1) * limit,
      take: limit,
    });

    return { records, total };
  }

  async findOne(id: number): Promise<Role | null> {
    return await this.roleRepository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    const result = await this.roleRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('角色不存在');
    }
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    // 先查询是否存在
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 合并更新数据
    const updatedRole = this.roleRepository.merge(role, updateRoleDto);

    // 使用 save 以确保触发实体钩子
    return await this.roleRepository.save(updatedRole);
  }

  /**
   * 分配资源给角色
   * @param assignDto 分配资源的DTO，包括角色ID和资源ID数组
   */
  async assignResources(assignDto: AssignResourcesDto): Promise<Role> {
    const { roleId, resourceIds } = assignDto;
    // 推荐使用 findOne({ where: { id } }) 或 findOneBy({ id })
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['menus'], // 假设 Role 与 Menu 存在多对多关系
    });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 替换弃用的 findByIds 方法，使用 In 操作符搭配 find 方法查询菜单
    role.menus = await this.menuRepository.find({
      where: { id: In(resourceIds) },
    });

    return this.roleRepository.save(role);
  }
}
