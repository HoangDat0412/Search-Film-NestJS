import { IsNotEmpty } from "class-validator";

export class CreatedActorDto {
    @IsNotEmpty()
    name: string
}