import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { CommentWeb } from '../entities/comment-web.entity';
import { CreateCommentWebDto } from '../dto/create-comment-web.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class CommentWebService {
  constructor(
    @InjectRepository(CommentWeb)
    private commentRepo: Repository<CommentWeb>,
  ) {}

  // 创建评论

  async create(dto: CreateCommentWebDto): Promise<CommentWeb> {
    const comment = this.commentRepo.create(dto);

    if (dto.parentId) {
      const parent = await this.commentRepo.findOne({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('父级评论不存在');
      }
      comment.parent = parent;
    } else {
      comment.parent = null; // 明确设为 null，表示一级评论
    }

    return this.commentRepo.save(comment);
  }

  async findPaginated(
    page = 1,
    limit = 10,
  ): Promise<{
    total: number;
    page: number;
    pageSize: number;
    data: CommentWeb[];
  }> {
    const [roots, count] = await this.commentRepo.findAndCount({
      where: { parentId: IsNull() },
      order: { date: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 递归查子评论
    const fetchChildren = async (parent: CommentWeb): Promise<void> => {
      const children = await this.commentRepo.find({
        where: { parentId: parent.id },
        order: { date: 'ASC' },
      });

      parent.children = children;

      for (const child of children) {
        await fetchChildren(child); // 递归加载子评论
      }
    };

    for (const root of roots) {
      await fetchChildren(root);
    }

    return {
      total: count,
      page,
      pageSize: limit,
      data: roots,
    };
  }
}
