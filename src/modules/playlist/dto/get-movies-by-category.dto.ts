import { IsOptional } from 'class-validator';

export class GetMoviesByCategoryDto {

  @IsOptional()
  page?: string

  @IsOptional()
  pageSize?: string
}