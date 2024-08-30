import { IsInt, IsOptional, Min } from 'class-validator';

export class GetDirectorsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  item_per_page?: number;
}
