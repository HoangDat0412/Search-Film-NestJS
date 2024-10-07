import { IsOptional } from 'class-validator';

export class GetDirectorsDto {
  @IsOptional()
  page?: string;

  @IsOptional()
  item_per_page?: string;
}
