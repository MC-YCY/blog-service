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

  // 获取某个月份有日记的日期及日记数量
  async getDiaryDaysByMonth(
    year: number,
    month: number,
    username?: string,
  ): Promise<{ day: number; count: number }[]> {
    // Create start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month

    // Set time to cover the whole day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Create query builder
    const queryBuilder = this.diaryRepository
      .createQueryBuilder('diary')
      .select('EXTRACT(DAY FROM diary.date)', 'day')
      .addSelect('COUNT(diary.id)', 'count')
      .where('diary.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('EXTRACT(DAY FROM diary.date)')
      .orderBy('day', 'ASC');

    // Add username filter if provided
    if (username) {
      queryBuilder.andWhere('diary.username = :username', { username });
    }

    // Execute query and return results
    const results: { day: string; count: string }[] =
      await queryBuilder.getRawMany();

    return results.map((result) => ({
      day: parseInt(result.day),
      count: parseInt(result.count),
    }));
  }
}
