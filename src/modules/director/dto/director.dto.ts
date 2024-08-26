import { IsNotEmpty, IsString } from "class-validator";


export class DirectorDto {
    @IsString()
    @IsNotEmpty()
    name: string
}