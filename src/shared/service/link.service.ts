import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Link } from '../entities/link.entity';

@Injectable()
export class LinkService {
  constructor(
    @InjectRepository(Link)
    private readonly linkRepository: Repository<Link>,
  ) {}

  findAll(): Promise<Link[]> {
    return this.linkRepository.find({ order: { date: 'DESC' } });
  }

  findOne(id: number): Promise<Link | null> {
    return this.linkRepository.findOneBy({ id });
  }

  create(link: Partial<Link>): Promise<Link> {
    const newLink = this.linkRepository.create(link);
    return this.linkRepository.save(newLink);
  }

  async update(id: number, updateData: Partial<Link>): Promise<Link | null> {
    await this.linkRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.linkRepository.delete(id);
  }
}
