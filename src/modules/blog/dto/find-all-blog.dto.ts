import { IsOptional, IsString, IsInt } from 'class-validator';

export class FindAllBlogDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  searchTerm?: string;
}
