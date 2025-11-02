// server/src/auth/auth.controller.ts
import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('signup')
    async signUp(@Body(ValidationPipe) dto: CreateUserDto) {
        return this.authService.signUp(dto);
    }
}