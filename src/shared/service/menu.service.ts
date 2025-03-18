import { InjectRepository } from '@nestjs/typeorm';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Menu } from '../entities/menu.entity';
import { In, IsNull, Repository, TreeRepository } from 'typeorm';
import { CreateMenuDto, UpdateMenuDto } from '../dto/menu.dto';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: TreeRepository<Menu>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  // 新增时，验证字段，是否已经存在库中
  async validateMenuUniqueness(createMenuDto: CreateMenuDto) {
    const { code, path, component } = createMenuDto;

    const existingMenu = await this.menuRepository.findOne({
      where: [
        code ? { code } : {},
        path ? { path } : {},
        component ? { component } : {},
      ],
    });

    if (existingMenu) {
      if (code && existingMenu.code === code) {
        throw new ConflictException(`Code ${code} 已存在`);
      }
      if (path && existingMenu.path === path) {
        throw new ConflictException(`Path ${path} 已存在`);
      }
      if (component && existingMenu.component === component) {
        throw new ConflictException(`Component ${component} 已存在`);
      }
    }
  }

  // 添加菜单
  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    await this.validateMenuUniqueness(createMenuDto);
    const menu = this.menuRepository.create(createMenuDto);
    if (createMenuDto.parentId) {
      const parent = await this.menuRepository.findOne({
        where: { id: createMenuDto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('父级菜单不存在');
      }
      menu.parent = parent;
    } else {
      // 不传 parentId 默认作为一级菜单（parent 为 null）
      menu.parent = null;
    }
    return this.menuRepository.save(menu);
  }

  // 更新时校验字段是否存在过
  async validateMenuUniquenessForUpdate(
    id: number,
    updateMenuDto: UpdateMenuDto,
  ) {
    const { code, path, component } = updateMenuDto;

    const existingMenu = await this.menuRepository.findOne({
      where: [
        code ? { code } : {},
        path ? { path } : {},
        component ? { component } : {},
      ],
    });

    if (existingMenu && existingMenu.id !== id) {
      if (code && existingMenu.code === code) {
        throw new ConflictException(`Code ${code} 已存在`);
      }
      if (path && existingMenu.path === path) {
        throw new ConflictException(`Path ${path} 已存在`);
      }
      if (component && existingMenu.component === component) {
        throw new ConflictException(`Component ${component} 已存在`);
      }
    }
  }
  // 修改菜单
  async update(id: number, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    await this.validateMenuUniquenessForUpdate(id, updateMenuDto);
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }
    if (updateMenuDto.parentId !== undefined) {
      if (updateMenuDto.parentId) {
        const parent = await this.menuRepository.findOne({
          where: { id: updateMenuDto.parentId },
        });
        if (!parent) {
          throw new NotFoundException('父级菜单不存在');
        }
        menu.parent = parent;
      } else {
        // parentId 为 0 或 null，视为顶级菜单
        menu.parent = null;
      }
    }
    // 合并其他字段
    Object.assign(menu, updateMenuDto);
    return this.menuRepository.save(menu);
  }

  // 删除菜单及其所有子菜单
  async delete(id: number): Promise<void> {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: ['children'],
    });

    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }

    // 递归删除所有子菜单
    if (menu.children && menu.children.length > 0) {
      for (const child of menu.children) {
        await this.delete(child.id);
      }
    }

    // 最后删除当前菜单
    await this.menuRepository.remove(menu);
  }

  transformTree = (menu: Menu): Menu => {
    if (!menu.children || menu.children.length === 0) {
      menu.children = null;
    } else {
      menu.children = menu.children.map(this.transformTree);
    }
    return menu;
  };

  // 分页查询树形结构菜单，返回 { records, total }
  async findAllPaginated(
    page = 1,
    limit = 10,
  ): Promise<{ records: Menu[]; total: number }> {
    // 使用 IsNull() 来查询 parent 为 null 的记录
    const [roots, total] = await this.menuRepository.findAndCount({
      where: { parent: IsNull() },
      order: { id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 对每个顶级菜单加载完整树形结构
    const records = await Promise.all(
      roots.map(async (root) =>
        this.transformTree(await this.menuRepository.findDescendantsTree(root)),
      ),
    );

    return { records, total };
  }

  // 查询所有菜单（树形结构），过滤掉 button 类型
  async findTree(): Promise<Menu[]> {
    // 先获取完整树形结构
    const trees = await this.menuRepository.findTrees();

    // 递归过滤出 type 为 menu 的菜单
    const filterTree = (menus: Menu[]): Menu[] => {
      return menus
        .filter((menu: Menu) => menu.type !== 'button')
        .map((menu: Menu) => {
          if (menu.children && menu.children.length > 0) {
            menu.children = filterTree(menu.children);
          }
          return menu;
        });
    };

    return filterTree(trees);
  }

  // 根据 id 查询菜单信息，返回菜单数据并附带 parentId 字段
  async findOneById(id: number): Promise<any> {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: ['parent'],
    });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }
    return {
      ...menu,
      parentId: menu.parent ? menu.parent.id : null,
    };
  }

  // 根据用户 ID 获取其角色的菜单 ID 列表
  async getMenuIdsByUserId(roleId: number): Promise<number[]> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['menus'],
    });
    if (!role) {
      throw new NotFoundException(`角色 ID ${roleId} 不存在`);
    }
    return role.menus.map((menu) => menu.id);
  }
  // 获取所有菜单的树结构
  async getMenuTree(): Promise<Menu[]> {
    return await this.menuRepository.findTrees();
  }

  /**
   * 根据角色 ID 和菜单 ID 列表设置角色的菜单关系
   * @param roleId 角色 ID
   * @param menuIds 菜单 ID 数组
   * @returns 更新后的 Role 实体
   */
  async setRoleMenus(roleId: number, menuIds: number[]): Promise<Role> {
    // 查找角色，并加载已关联的菜单
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['menus'],
    });
    if (!role) {
      throw new NotFoundException(`角色 ID ${roleId} 不存在`);
    }
    // 使用 In 查询所有指定的菜单
    const menus = await this.menuRepository.find({
      where: { id: In(menuIds) },
    });
    if (menus.length !== menuIds.length) {
      throw new NotFoundException(`部分菜单 ID 不存在`);
    }
    // 设置角色的菜单关系
    role.menus = menus;
    // 保存更新后的角色信息
    return await this.roleRepository.save(role);
  }
}
