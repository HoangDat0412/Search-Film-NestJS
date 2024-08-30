import { IsOptional, IsString, IsNumber } from 'class-validator';

export class GetTopMoviesDto {
  @IsOptional()
  @IsNumber()
  readonly limit?: number;
}