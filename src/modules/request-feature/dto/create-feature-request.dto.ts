import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFeatureRequestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  url_image: string;
}
