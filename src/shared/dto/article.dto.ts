import { ArticleStatus } from '../enums/article-status.enum';

export class CreateArticleDto {
  readonly title: string;
  readonly content: string;
  tags: Array<string>;
  readme: string;
  status?: ArticleStatus; // 允许创建时指定状态（默认DRAFT）
  banner: string;
}

export class UpdateArticleDto {
  readonly title?: string;
  readonly content?: string;
  tags: Array<string>;
  readme: string;
  articleId: number;
  status?: ArticleStatus; // 允许创建时指定状态（默认DRAFT）
}

export class PaginateArticleDto {
  page?: number = 1;
  limit?: number = 10;
  status?: ArticleStatus; // 增加状态过滤
  tag?: string;
  title?: string;
}
