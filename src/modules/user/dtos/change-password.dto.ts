import { IsString, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  readonly oldPassword: string;

  @IsString()
  @IsNotEmpty()
  readonly newPassword: string;
}