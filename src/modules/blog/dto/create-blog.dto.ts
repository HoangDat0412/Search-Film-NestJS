import { IsString, IsOptional, IsInt, IsNotEmpty } from 'class-validator';

export class CreateBlogDto {

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  movie_id?: string;

  @IsString()
  @IsOptional()
  image_url?: string;
}
