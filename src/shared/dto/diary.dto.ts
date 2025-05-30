import {
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateDiaryDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class GetDiariesDto {
  @IsDateString()
  date: string; // ISO格式日期字符串 (YYYY-MM-DD)

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
