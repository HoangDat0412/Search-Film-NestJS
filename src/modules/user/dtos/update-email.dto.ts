import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateEmailDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}