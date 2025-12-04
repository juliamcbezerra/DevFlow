import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { CreateUserDto, LoginSessionDto } from './dto/user.dto';
import { access } from 'fs';

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
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.login },
          { username: dto.login },
        ],
      },
    });

    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    // 2. Validar senha
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Credenciais inválidas');

    // 3. Gerar JWT
    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    // 4. SALVAR SESSÃO NO BANCO
    const expiresAt = new Date();
    if (dto.rememberMe) {
      // 30 dias
      expiresAt.setDate(expiresAt.getDate() + 30);
    } else {
      expiresAt.setDate(expiresAt.getDate() + 1);
    }
    
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
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
    };
  }

async requestPasswordChange(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    // Gera código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15); // Validade de 15 min

    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        resetCode: code,
        resetCodeExpires: expires
      }
    });

    // --- MOCK DE ENVIO DE EMAIL ---
    console.log(`\n📧 [EMAIL MOCK] Para: ${user.email}`);
    console.log(`🔑 Seu código de verificação é: ${code}\n`);
    // Aqui você integraria com SendGrid, AWS SES, Nodemailer, etc.

    return { message: 'Código de verificação enviado para seu e-mail.' };
  }

  // 2. CONFIRMAR TROCA (Valida código e muda senha)
  async confirmPasswordChange(userId: string, dto: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (!user || !user.resetCode || !user.resetCodeExpires) {
        throw new BadRequestException('Nenhum pedido de troca de senha ativo.');
    }

    if (new Date() > user.resetCodeExpires) {
        throw new BadRequestException('Código expirado. Solicite novamente.');
    }

    if (user.resetCode !== dto.code) {
        throw new BadRequestException('Código incorreto.');
    }

    // Hashear nova senha
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
        resetCode: null,
        resetCodeExpires: null
      }
    });

    return { message: 'Senha alterada com sucesso!' };
  }
}