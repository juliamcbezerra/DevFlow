import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { CreateUserDto, LoginSessionDto } from './dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // --- CADASTRO ---
  async signUp(dto: CreateUserDto) {
    // 1. Verificar se email já existe
    const emailExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (emailExists) throw new ConflictException('Email já está em uso.');

    // 2. Lógica de Username (Blindagem)
    let finalUsername = dto.username;

    if (finalUsername) {
      // Se o usuário mandou um username, verifica se já existe
      const usernameExists = await this.prisma.user.findUnique({
        where: { username: finalUsername },
      });
      if (usernameExists) throw new ConflictException('Este nome de usuário já está em uso.');
    } else {
      // Se NÃO mandou, gera um automático (ex: lucas_17327328)
      // Pega a parte antes do @ e adiciona timestamp para garantir unicidade
      const emailPrefix = dto.email.split('@')[0];
      finalUsername = `${emailPrefix}_${Date.now()}`;
    }

    // 3. Hash da senha
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 4. Criar usuário
    await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        username: finalUsername, 
        birthDate: new Date(dto.birthDate),
      },
    });

    return { message: 'Usuário criado com sucesso!' };
  }

  // --- LOGIN ---
  async signIn(dto: LoginSessionDto, res: Response) {
    // 1. Buscar usuário
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    // 2. Validar senha
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Credenciais inválidas');

    // 3. Gerar JWT
    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    // 4. SALVAR SESSÃO NO BANCO
    // Diagrama do fluxo de autenticação:
    // 
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    await this.prisma.session.create({
      data: {
        sessionToken: token,
        userId: user.id,
        expires: expiresAt,
      },
    });

    // 5. INJETAR COOKIE
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: false, // localhost
      sameSite: 'lax',
      expires: expiresAt,
    });

    // 6. Retornar usuário
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}