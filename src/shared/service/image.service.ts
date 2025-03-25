import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { Image } from '../entities/image.entity';
import { getServerIp } from '../utils/server-ip';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    private userService: UserService,
  ) {}

  async uploadFiles(files: Express.Multer.File[], userId: number) {
    const ip = getServerIp();
    // 检查用户是否存在
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const results: Image[] = [];
    for (const file of files) {
      const image = new Image();
      image.originalname = file.originalname;
      image.mimetype = file.mimetype;
      image.path = `${ip}/${file.path.replace(/\\/g, '/')}`;
      image.size = file.size;
      image.userId = userId;

      const savedImage = await this.imageRepository.save(image);
      results.push(savedImage);
    }
    return results;
  }

  async findAll(options: {
    page: number;
    limit: number;
    filename?: string;
    userId: number;
  }) {
    const query = this.imageRepository.createQueryBuilder('image');

    // 添加用户ID条件
    query.where('image.userId = :userId', { userId: options.userId });

    if (options.filename) {
      query.andWhere('image.originalname LIKE :filename', {
        filename: `%${options.filename}%`,
      });
    }

    const [items, total] = await query
      .skip((options.page - 1) * options.limit)
      .take(options.limit)
      .getManyAndCount();

    return {
      records: items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }
}
