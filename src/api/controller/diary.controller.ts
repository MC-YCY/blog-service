import { Controller, Post, Get, Body, Query } from '@nestjs/common';
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
}
