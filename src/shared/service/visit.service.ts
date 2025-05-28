import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Visit } from '../entities/visit.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VisitService {
  constructor(
    @InjectRepository(Visit)
    private VisitRepository: Repository<Visit>,
  ) {}

  private getToday(): string {
    return new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
  }

  async increment() {
    const today = this.getToday();
    let record = await this.VisitRepository.findOne({ where: { date: today } });

    if (record) {
      record.count += 1;
    } else {
      record = this.VisitRepository.create({ date: today, count: 1 });
    }

    await this.VisitRepository.save(record);
  }

  async getStats() {
    const total = await this.VisitRepository
      .createQueryBuilder('s')
      .select('SUM(s.count)', 'sum')
      .getRawOne<{ sum: string | null }>(); // 👈 指定返回类

    const today = this.getToday();
    const todayRecord = await this.VisitRepository.findOne({
      where: { date: today },
    });

    return {
      total: Number(total?.sum ?? 0),
      today: todayRecord?.count ?? 0,
    };
  }
}
