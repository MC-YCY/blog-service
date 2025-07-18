import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { Link } from '../../shared/entities/link.entity';
import { LinkService } from '../../shared/service/link.service';
import { Public } from '../../shared/decorators/public.decorator';

@Public()
@Controller('links')
export class LinkController {
  constructor(private readonly linkService: LinkService) {}

  @Get()
  findAll(): Promise<Link[]> {
    return this.linkService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Link | null> {
    return this.linkService.findOne(+id);
  }

  @Post()
  create(@Body() link: Partial<Link>): Promise<Link> {
    return this.linkService.create(link);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateData: Partial<Link>,
  ): Promise<Link | null> {
    return this.linkService.update(+id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.linkService.remove(+id);
  }
}
