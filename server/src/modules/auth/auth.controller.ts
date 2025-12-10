// server/src/auth/auth.controller.ts

import { Controller, Post, Body, ValidationPipe, Res, Req, UseGuards } from '@nestjs/common';
import { AuthService } from 'src/modules/auth/auth.service';
import { CreateUserDto, LoginSessionDto } from 'src/modules/auth/dto/user.dto';
import { JwtGuard } from 'src/modules/jwt/jwt.guard';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('signup')
    async signUp(@Body(ValidationPipe) dto: CreateUserDto) {
        return this.authService.signUp(dto);
    }

    @Post('signin')
    async signIn(@Body(ValidationPipe) body: LoginSessionDto, @Res({ passthrough: true }) res: Response) {
        return this.authService.signIn(body, res)
    }

    @Post('verify-email')
    async verifyEmail(@Body('token') token: string) {
        return this.authService.verifyEmail(token);
    }

    // ⭐ RENOMEADO: Rota para o frontend chamar no modal (ForgotPasswordModal)
    @Post('forgot-password') 
    async requestChange(@Body('email') email: string) {
        return this.authService.requestPasswordChange(email);
    }

    // ⭐ RENOMEADO: Rota para o frontend chamar na tela de redefinição (ResetPasswordPage)
    @Post('reset-password')
    async confirmChange(@Body() body: any) {
        return this.authService.confirmPasswordChange(body);
    }
}