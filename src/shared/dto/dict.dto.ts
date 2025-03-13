// src/dict/dto/create-dict.dto.ts
import { IsArray, IsBoolean, IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

class DictEntryDto {
  @IsString()
  label: string;

  @IsNotEmpty()
  value: string | number;
}

export class CreateDictDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsArray()
  entries: DictEntryDto[];

  @IsBoolean()
  status: boolean;

  @IsNumber()
  sort: number;

  @IsString()
  remark: string;
}

// src/dict/dto/update-dict.dto.ts
export class UpdateDictDto extends PartialType(CreateDictDto) {}
