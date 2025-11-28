// server/src/auth/dto/create-user.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsDateString, 
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; 

export interface UserDto {
  id: string;
  email: string;
  name: string | null;
  password: string;
  createdAt: Date;
}

export class CreateUserDto {
  @ApiProperty({
    description: 'Email do usuário (deve ser único)',
    example: 'millena@devflow.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'Millena UI Lead',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Nome de usuário único (slug). Se não enviado, será gerado automaticamente.',
    example: 'millena_dev',
    required: false, 
  })
  @IsOptional() 
  @IsString()
  username?: string;

  @ApiProperty({
    description: 'Senha segura (mínimo 8 caracteres)',
    example: 'senhaSegura123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
  password: string;

  @ApiProperty({ example: '2000-12-25', description: 'Data de nascimento (YYYY-MM-DD)' })
  @IsDateString() 
  @IsNotEmpty()
  birthDate: string;
}

export class SessionDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;
}

export class LoginSessionDto {
  @ApiProperty({
    description: 'Email ou Nome de usuário',
    example: 'lucas@devflow.com ou lucas_dev',
  })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: '12345678',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'A senha possui pelo menos 8 caracteres' })
  password: string;
}