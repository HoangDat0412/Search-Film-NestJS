import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty()
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
  @Type(() => Number)
  @IsArray()
  @IsNumber({}, { each: true })
  movie_genres: number[];
  @Type(() => Number)
  @IsArray()
  @IsNumber({}, { each: true })
  movie_countries: number[];
  @Type(() => Number)
  @IsArray()
  @IsNumber({}, { each: true })
  movie_actors: number[];
  @Type(() => Number)
  @IsArray()
  @IsNumber({}, { each: true })
  movie_directors: number[];
  @Type(() => Number)
  @IsArray()
  @IsNumber({}, { each: true })
  category_movies: number[];
}