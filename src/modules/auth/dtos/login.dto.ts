import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  recaptchaToken: string

  @MinLength(6)
  password: string;
}
