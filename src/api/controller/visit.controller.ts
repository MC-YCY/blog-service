import { Controller, Get, Post } from '@nestjs/common';
import { VisitService } from '../../shared/service/visit.service';
import { Public } from '../../shared/decorators/public.decorator';

@Public()
@Controller('visit')
export class VisitController {
  constructor(private readonly statsService: VisitService) {}

  @Get()
  getStats() {
    return this.statsService.getStats();
  }

  @Post()
  addStats() {
    return this.statsService.increment();
  }
}
