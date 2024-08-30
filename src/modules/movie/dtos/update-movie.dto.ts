import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional } from 'class-validator';

export class UpdateMovieDto {
  @IsOptional()
  name: string;

  origin_name: string;
  content: string;

  type: string;
  status: string;
  thumb_url: string;
  trailer_url: string;
  duration: string;
  episode_current: string;
  episode_total: string;
  quality: string;
  lang: string;
  notify: string;
  showtimes: string;
  @Type(() => Number)
  year: number;
  is_copyright: boolean;
  chieurap: boolean;
  poster_url: string;
  sub_docquyen: boolean;
  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @IsNumber({}, { each: true })
  movie_genres: number[];
  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @IsNumber({}, { each: true })
  movie_countries: number[];
  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  movie_actors: number[];
  @Type(() => Number)
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  movie_directors: number[];
}
