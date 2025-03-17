import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Menu } from '../entities/menu.entity';
import { IsNull, TreeRepository } from 'typeorm';
import { CreateMenuDto, UpdateMenuDto } from '../dto/menu.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: TreeRepository<Menu>,
  ) {}

  // 添加菜单
  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
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

  // 修改菜单
  async update(id: number, updateMenuDto: UpdateMenuDto): Promise<Menu> {
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

  // 删除菜单
  async delete(id: number): Promise<void> {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }
    await this.menuRepository.remove(menu);
  }

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
      roots.map(async (root) => this.menuRepository.findDescendantsTree(root)),
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
}
