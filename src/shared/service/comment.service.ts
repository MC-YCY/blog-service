import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { CreateCommentDto } from '../dto/comment.dto';
import { User } from '../entities/user.entity';
import { Article } from '../entities/article.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
  ) {}

  // 创建评论
  async createComment(createCommentDto: CreateCommentDto): Promise<Comment> {
    const { content, articleId, authorId } = createCommentDto;
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
    });
    if (!article) {
      throw new NotFoundException(`Article with id ${articleId} not found`);
    }
    const author = await this.userRepository.findOne({
      where: { id: authorId },
    });
    if (!author) {
      throw new NotFoundException(`User with id ${authorId} not found`);
    }
    const comment = this.commentRepository.create({
      content,
      article,
      author,
    });
    return this.commentRepository.save(comment);
  }

  // 根据文章 ID 查询评论，带上作者信息
  async getCommentsByArticle(articleId: number): Promise<Comment[]> {
    return await this.commentRepository.find({
      where: { article: { id: articleId } },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });
  }

  // 删除评论
  async deleteComment(commentId: number): Promise<void> {
    const result = await this.commentRepository.delete(commentId);
    if (result.affected === 0) {
      throw new NotFoundException(`Comment with id ${commentId} not found`);
    }
  }
}
