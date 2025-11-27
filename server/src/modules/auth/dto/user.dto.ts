// server/src/auth/dto/create-user.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional, // <--- Importante adicionar isso
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; 

// Interface para tipagem interna (opcional)
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

  // --- ADICIONE ESTE CAMPO NOVO 👇 ---
  @ApiProperty({
    description: 'Nome de usuário único (slug). Se não enviado, será gerado automaticamente.',
    example: 'millena_dev',
    required: false, // Marca como opcional no Swagger
  })
  @IsOptional() // Marca como opcional na validação
  @IsString()
  username?: string;
  // ----------------------------------

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

// ATENÇÃO: Como mudamos para Cookies, o login não retorna mais tokens no JSON.
// Esta classe abaixo servia para quando retornávamos o token. 
// Você pode mantê-la se quiser usar em outro lugar, mas o login agora retorna apenas o User.
export class SessionDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;
  // Tokens foram removidos daqui pois agora vão via Cookie HttpOnly
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