import { IsNotEmpty } from "class-validator";

export class CreateEpisodeDto {
  server_name: string;
  @IsNotEmpty()
  name: string;
  filename: string;
  @IsNotEmpty()
  link_film: string;
}