// src/dict/dto/create-dict.dto.ts
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';

class DictEntryDto {
  @IsString()
  label: string;

  @IsNotEmpty()
  value: string | number;
}

export class CreateDictDto {
  @IsNotEmpty({ message: '名称不能为空' })
  name: string;

  @IsNotEmpty({ message: '类型不能为空' })
  type: string;

  @IsBoolean()
  status: boolean;

  @IsNumber()
  sort: number;

  @IsOptional()
  remark?: string;

  @IsArray()
  entries: Array<{ label: string; value: string }>;
}

// src/dict/dto/update-dict.dto.ts
export class UpdateDictDto extends PartialType(CreateDictDto) {
  @ApiPropertyOptional({ description: '字典条目' })
  entries?: Array<{ label: string; value: string }>;
}
