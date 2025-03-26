import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { Image } from '../entities/image.entity';
import { getServerIp } from '../utils/server-ip';
import { unlink } from 'fs-extra';

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

    query.orderBy('image.uploadedAt', 'DESC');

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
  /**
   * 根据 image 的 id 删除记录并删除本地文件
   * @param id 图片记录 id
   * @param userId 当前用户 id，用于确保只能删除自己的图片
   */
  async deleteImageById(id: number, userId: number) {
    // 查询图片记录，确保该图片属于当前用户
    const image = await this.imageRepository.findOne({ where: { id, userId } });
    if (!image) {
      throw new NotFoundException('图片不存在');
    }

    // 获取服务器 ip，用于从 image.path 中剥离出本地文件路径
    const ip = getServerIp();
    // 假设 image.path 格式为 `${ip}/${file.path}`，从中提取本地文件路径
    const localFilePath = image.path.replace(`${ip}/`, '');

    // 删除本地文件
    try {
      await unlink(localFilePath);
    } catch {
      // 删除文件失败时，根据需求可以选择抛出异常或者记录日志
      throw new InternalServerErrorException('删除本地文件失败');
    }

    // 删除数据库中的图片记录
    await this.imageRepository.remove(image);

    return { success: true };
  }
}
