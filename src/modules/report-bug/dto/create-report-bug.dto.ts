import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateReportBugDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  url_image?: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}