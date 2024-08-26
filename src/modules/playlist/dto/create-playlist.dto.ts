import { IsNotEmpty, IsString } from "class-validator";


export class CreatePlaylist {
    @IsString()
    @IsNotEmpty()
    name: string;
}