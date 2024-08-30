import { IsString, IsOptional, IsInt, IsNotEmpty } from 'class-validator';

export class CreateBlogDto {

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsInt()
  @IsOptional()
  movie_id?: number;

  @IsString()
  @IsOptional()
  image_url?: string;
}
