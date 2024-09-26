// src/movies/dto/filter-most-view.dto.ts
import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterMostViewDTO {
  @IsOptional()
  @IsString()
  year?: number;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  // @Type(() => Number)
  limit?: number = 10;
}
