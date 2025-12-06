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

    @UseGuards(JwtGuard)
    @Post('request-password-change')
    async requestChange(@Req() req: any) {
        return this.authService.requestPasswordChange(req.user.id);
    }

    @UseGuards(JwtGuard)
    @Post('confirm-password-change')
    async confirmChange(@Body() body: any, @Req() req: any) {
        return this.authService.confirmPasswordChange(req.user.id, body);
  }
}