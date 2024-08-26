import { IsNotEmpty, IsNumber, IsString, Max, Min } from "class-validator";

export class AddRatingDto {
    @IsNumber()
    @Min(1)
    @Max(5)
    score: number;

    @IsString()
    @IsNotEmpty()
    review: string;
}