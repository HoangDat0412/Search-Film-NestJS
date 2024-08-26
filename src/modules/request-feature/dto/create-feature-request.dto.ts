import { IsNotEmpty, IsString } from "class-validator";


export class CreateFeatureRequestDto {
    @IsString()
    @IsNotEmpty()
    title: string;
    
    @IsString()
    @IsNotEmpty()
    description: string
}