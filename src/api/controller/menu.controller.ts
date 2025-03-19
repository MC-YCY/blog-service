import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { MenuService } from '../../shared/service/menu.service';
import { CreateMenuDto, UpdateMenuDto } from '../../shared/dto/menu.dto';
import { Menu } from '../../shared/entities/menu.entity';
import { JwtService } from '@nestjs/jwt';

@Controller('menu')
export class MenuController {
  constructor(
    private readonly menuService: MenuService,
    private readonly jwtService: JwtService,
  ) {}

  // 创建菜单
  @Post()
  async create(@Body() createMenuDto: CreateMenuDto): Promise<Menu> {
    return await this.menuService.create(createMenuDto);
  }

  // 更新菜单
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMenuDto: UpdateMenuDto,
  ): Promise<Menu> {
    return await this.menuService.update(Number(id), updateMenuDto);
  }

  // 删除菜单
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.menuService.delete(Number(id));
  }

  // 分页查询菜单
  @Get()
  async findAllPaginated(
    @Query('pageNo') page = '1',
    @Query('pageSize') limit = '10',
  ): Promise<{ records: Menu[]; total: number }> {
    return await this.menuService.findAllPaginated(Number(page), Number(limit));
  }

  // 查询树形结构菜单，过滤掉 button 类型
  @Get('tree')
  async findTree(): Promise<Menu[]> {
    return await this.menuService.findTree();
  }

  // 根据id查询，信息包含parentId
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return await this.menuService.findOneById(id);
  }

  // 根据用户 ID 获取菜单 ID 列表
  @Get('ids/:userId')
  async getMenuIds(@Param('userId', ParseIntPipe) userId: number) {
    return this.menuService.getMenuIdsByUserId(userId);
  }

  // 获取所有菜单的树结构
  @Post('all')
  async getMenuTree() {
    return this.menuService.getMenuTree();
  }

  getTokenUserInfo(request: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const authHeader: string = request.headers['authorization'];
    const token = authHeader ? authHeader.split(' ')[1] : null;
    if (!token) {
      throw new UnauthorizedException('未提供 token');
    }

    let decoded: { account: string; userId: number };
    try {
      decoded = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('无效的 token');
    }

    if (!decoded || !decoded.account) {
      throw new UnauthorizedException('无效的 token 数据');
    }
    return decoded;
  }

  @Get('user/menus')
  async getUserMenus(@Req() request: Request) {
    const decoded = this.getTokenUserInfo(request);
    return await this.menuService.getMenusByUserId(decoded.userId);
  }

  @Get('user/buttons')
  async getUserButtons(@Req() request: Request) {
    const decoded = this.getTokenUserInfo(request);
    return await this.menuService.getButtonMenusFlatByUserId(decoded.userId);
  }
}
