import {
  IsOptional,
  IsInt,
  IsString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class FilterMovieDto {
  @IsOptional()
  @IsInt()
  movie_country?: number; // Single Country ID

  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  @IsInt()
  movie_genre?: number; // Single Genre ID

  @IsOptional()
  @IsString()
  search_query?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  tmdb_vote_average?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number; // Page number for pagination

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number; // Number of results per page
}
