import { IsOptional } from "class-validator";

export class GetGenreDto {
    page: string
    item_per_page: string
    @IsOptional()
    search?: string;
}