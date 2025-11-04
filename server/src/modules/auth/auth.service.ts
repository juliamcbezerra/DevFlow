import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, LoginSessionDto, SessionDto } from 'src/modules/auth/dto/user.dto';
import * as bcrypt from 'bcrypt';
import { IAuthRepository } from './auth-interface';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';

@Injectable()
export class AuthService {
    constructor(
        private auth: IAuthRepository,
        private jwtService: JwtService,
    ) {}

        // @param

    async signUp(data: CreateUserDto) {
        // 1. Checar se o usuário já existe
        const userExists = await this.auth.findByEmail(data.email);

        if (userExists) throw new ConflictException('Email já cadastrado');
        
        // 2. Hashear a senha (Implementando AUTH-03)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        // 3. Substituir senha original pela hasheada
        const newUserData = {...data, password: hashedPassword};

        // 4. Salvar o novo usuário no banco
        const user = await this.auth.signup(newUserData);

        // 5. Retornar o usuário criado (sem a senha)
        const { password, ...result } = user;

        return result;
    }

    async signIn(data: LoginSessionDto, res: Response) {
        // 1. Checa se existe o usuário
        const user = await this.auth.findByEmail(data.email);

        if(!user) throw new UnauthorizedException('Credenciais inválidas');

        // 2. Checa se a senha está correta
        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if(!isPasswordValid) throw new UnauthorizedException('Credenciais inválidas');
        
        // 3. Cria os tokens
        const payload = { sub: user.id, email: user.email };

        const accessToken = await this.jwtService.sign(payload, { expiresIn: '1h'});
        const refreshToken = await this.jwtService.sign(payload, { expiresIn: '15d'});
        
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000, // 1 hora
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 24 * 60 * 60 * 1000, // 15 dias
        });

        // 4. Cria sessão no banco
        const sessionData: SessionDto = {
            userId: user.id,
            accessToken,
            refreshToken,
        };

        const session = await this.auth.signin(sessionData);
        
        // 5. Retornar usuário logado 
        return { 
            message: 'Login bem-sucedido',
            userId: session.userId
        };
    }
}