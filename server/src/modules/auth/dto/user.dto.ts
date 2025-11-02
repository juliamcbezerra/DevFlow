// server/src/auth/dto/create-user.dto.ts
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
} from 'class-validator';

export interface UserDto {
    id: string;
    email: string;
    name: string | null;
    password: string;
    createdAt: Date;
}

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8, {message: 'A senha deve ter pelo menos 8 caracteres' })
    password: string;
}