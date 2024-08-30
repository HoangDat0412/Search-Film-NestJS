import { IsOptional, IsString, IsInt } from 'class-validator';

export class FindAllBlogDto {
  @IsInt()
  @IsOptional()
  page?: number;

  @IsInt()
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  searchTerm?: string;
}
