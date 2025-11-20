// server/src/auth/dto/create-user.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; 

// Interface não precisa de decorator do Swagger, pois não é usada diretamente na validação
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
    description: 'Senha segura (mínimo 8 caracteres)',
    example: 'senhaSegura123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
  password: string;
}

// Esta classe define o que o Backend RESPONDE. É útil documentar também!
export class SessionDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ description: 'Token JWT para acesso', example: 'eyJhbGciOiJIUz...' })
  accessToken: string;

  @ApiProperty({ description: 'Token para renovar a sessão', example: 'eyJhbGciOiJIUz...' })
  refreshToken: string;
}

export class LoginSessionDto {
  @ApiProperty({
    description: 'Email cadastrado',
    example: 'lucas@devflow.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: '12345678',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'A senha possui pelo menos 8 caracteres' })
  password: string;
}