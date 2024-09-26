import { IsOptional, IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class MovieRankingDto {
  @IsOptional()
  @Type(() => Number) // Converts string to a number
  @IsInt()
  @IsPositive()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  year?: string;

  @IsOptional()
  genre?: string;

  @IsOptional()
  country?: string;
}
