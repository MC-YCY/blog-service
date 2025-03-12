import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { RoleService } from '../../shared/service/role.service';
import { CreateRoleDto } from '../../shared/dto/role.dto';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.roleService.findOne(id);
  }
}
