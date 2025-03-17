export class CreateMenuDto {
  name: string;
  path: string;
  component: string;
  type: 'menu' | 'button';
  icon?: string;
  code?: string;
  explain?: string;
  // 如果设置父级菜单，则传入 parentId；不传则默认为一级菜单
  parentId?: number;
}
export class UpdateMenuDto {
  name?: string;
  path?: string;
  component?: string;
  type?: 'menu' | 'button';
  icon?: string;
  code?: string;
  explain?: string;
  parentId?: number;
}
