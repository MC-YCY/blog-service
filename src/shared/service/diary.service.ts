import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CreateDiaryDto, GetDiariesDto } from '../dto/diary.dto';
import { Diary } from '../entities/diary.entity';

@Injectable()
export class DiaryService {
  constructor(
    @InjectRepository(Diary)
    private readonly diaryRepository: Repository<Diary>,
  ) {}

  // 创建新日记
  async createDiary(createDiaryDto: CreateDiaryDto): Promise<Diary> {
    const diary = this.diaryRepository.create(createDiaryDto);
    return this.diaryRepository.save(diary);
  }

  // 根据日期查询日记（带分页）
  async getDiariesByDate({
    date,
    page = 1,
    limit = 10,
  }: GetDiariesDto): Promise<{ data: Diary[]; total: number }> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const [data, total] = await this.diaryRepository.findAndCount({
      where: {
        date: Between(startDate, endDate),
      },
      order: { date: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }
}
