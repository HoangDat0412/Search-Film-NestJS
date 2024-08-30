import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateUsernameDto {
  @IsString()
  @IsNotEmpty()
  readonly username: string;
}
