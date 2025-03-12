import { Injectable } from '@nestjs/common';
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

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const { authorId, articleId, content } = createCommentDto;

    const author = await this.userRepository.findOne({
      where: { id: authorId },
    });
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
    });

    if (!author || !article) {
      throw new Error('User or Article not found');
    }

    const comment = this.commentRepository.create({ content, author, article });
    return await this.commentRepository.save(comment);
  }

  async findAll(): Promise<Comment[]> {
    return await this.commentRepository.find({
      relations: ['author', 'article'],
    });
  }

  async findByArticle(articleId: number): Promise<Comment[]> {
    return await this.commentRepository.find({
      where: { article: { id: articleId } },
      relations: ['author'],
    });
  }

  async remove(id: number): Promise<void> {
    await this.commentRepository.delete(id);
  }
}
