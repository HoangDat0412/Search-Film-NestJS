import { IsNotEmpty, IsString } from "class-validator";


export class CreateBugReportDto {
    @IsString()
    @IsNotEmpty()
    title: string;
    
    @IsString()
    @IsNotEmpty()
    description: string
}