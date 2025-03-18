import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import {
  AssignResourcesDto,
  CreateRoleDto,
  UpdateRoleDto,
} from '../dto/role.dto';
import { Menu } from '../entities/menu.entity';
import { Permission } from '../entities/permission.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,

    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,

    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
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
    // 先检查该角色是否被用户引用
    const usersWithRole = await this.userRepository.count({
      where: { role: { id } }, // 这里应该是 roleId，而不是 id
    });

    if (usersWithRole > 0) {
      throw new BadRequestException(
        `无法删除角色 ID ${id}，因为仍然有 ${usersWithRole} 个用户使用该角色`,
      );
    }

    await this.roleRepository.delete(id);
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

  // 角色id查询，用户
  async findRoleUsers(
    id: number,
    page: number = 1,
    limit: number = 10,
    orderBy: keyof User = 'id', // 限制为User实体的属性
    order: 'ASC' | 'DESC' = 'ASC',
  ): Promise<{
    role: Omit<Omit<Omit<Role, 'users'>, 'permissions'>, 'menus'>;
    users: User[];
    pagination: {
      total: number;
      currentPage: number;
      totalPages: number;
      limit: number;
    };
  }> {
    // 参数验证
    if (page < 1) throw new Error('Invalid page number');
    if (limit < 1 || limit > 100) throw new Error('Invalid limit value');

    // 并行查询角色和用户数据
    const [role, [users, total]] = await Promise.all([
      this.roleRepository.findOneBy({ id }),
      this.userRepository.findAndCount({
        where: { role: { id } },
        order: { [orderBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return {
      role: {
        id: role.id,
        name: role.name,
        code: role.code,
      },
      users,
      pagination: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    };
  }

  // 角色id查询，权限
  async findRolePermissions(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`角色不存在`);
    }

    return role;
  }
  // 更新，角色权限
  async updateRolePermissions(
    roleId: number,
    permissionIds: number[],
  ): Promise<Role> {
    // 验证角色是否存在
    const role = await this.roleRepository.findOneBy({ id: roleId });
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    // 验证所有权限是否存在
    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionIds) },
    });

    if (permissions.length !== permissionIds.length) {
      const foundIds = permissions.map((p) => p.id);
      const missingIds = permissionIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Permissions not found: ${missingIds.join(', ')}`,
      );
    }

    // 更新关联
    role.permissions = permissions;
    return this.roleRepository.save(role);
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
