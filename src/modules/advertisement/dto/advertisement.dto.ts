import { IsNotEmpty, IsString } from "class-validator";


export class AdvertismentDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    content: string;

    image_url: string;

    target_url: string;
}