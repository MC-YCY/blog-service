import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { DiaryService } from '../../shared/service/diary.service';
import { CreateDiaryDto, GetDiariesDto } from '../../shared/dto/diary.dto';
import { Public } from '../../shared/decorators/public.decorator';

@Public()
@Controller('diaries')
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  @Post()
  async create(@Body() createDiaryDto: CreateDiaryDto) {
    return this.diaryService.createDiary(createDiaryDto);
  }

  @Get()
  async getByDate(@Query() getDiariesDto: GetDiariesDto) {
    return this.diaryService.getDiariesByDate(getDiariesDto);
  }

  @Get('/month')
  async getMonthDiary(
    @Query('date') date: string,
    @Query('username') username?: string,
  ) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    return this.diaryService.getDiaryDaysByMonth(year, month, username);
  }
}
