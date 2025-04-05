import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { Notification } from './notification.entity';

export class PaginateNotificationsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  read?: string;
}

export interface PaginatedNotificationsResult {
  items: Notification[];
  total: number;
  unreadCount: number;
}
