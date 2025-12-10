import { 
  Injectable, 
  UnauthorizedException, 
  ConflictException, 
  NotFoundException, 
  BadRequestException, 
  ForbiddenException 
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { CreateUserDto, LoginSessionDto } from './dto/user.dto';
import { MailService } from '../mail/mail.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
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
      const usernameExists = await this.prisma.user.findUnique({
        where: { username: finalUsername },
      });
      if (usernameExists) throw new ConflictException('Este nome de usuário já está em uso.');
    } else {
      // Gera automático se não vier
      const emailPrefix = dto.email.split('@')[0];
      finalUsername = `${emailPrefix}_${Date.now()}`;
    }

    // 3. Hash da senha
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 4. Gera Token de Verificação
    const verificationToken = uuidv4();

    // 5. Criar usuário (Não verificado e onboarding em false inicialmente)
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        username: finalUsername, 
        birthDate: new Date(dto.birthDate),
        isVerified: false, 
        verificationToken: verificationToken,
        onboardingCompleted: false, // Inicia como false
        avatarUrl: `https://ui-avatars.com/api/?name=${dto.name}&background=random`,
      },
    });

    // 6. Envia Email (Com tratamento de erro para não travar o cadastro)
    try {
      await this.mailService.sendVerificationEmail(dto.email, verificationToken);
    } catch (error) {
      console.error("⚠️ Erro ao enviar email de verificação:", error);
    }

    return { message: 'Cadastro realizado. Verifique seu e-mail!' };
  }

  // --- LOGIN ---
  async signIn(dto: LoginSessionDto, res: Response) {
    // 1. Buscar usuário por email ou username
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.login },
          { username: dto.login },
        ],
      },
      // 💥 BUSCA COMPLETA: Incluindo onboardingCompleted para o Front-end
      select: {
          id: true,
          email: true,
          name: true,
          username: true,
          password: true, 
          avatarUrl: true,
          isVerified: true,
          onboardingCompleted: true, // <--- CRÍTICO: CAMPO ADICIONADO AQUI
      }
    });

    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    // 2. 🔥 BLOQUEIO DE VERIFICAÇÃO 🔥
    if (!user.isVerified) {
      throw new ForbiddenException('Por favor, verifique seu e-mail antes de entrar.');
    }

    // 3. Validar senha
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Credenciais inválidas');

    // 4. Gerar JWT
    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    // 5. Salvar Sessão
    const expiresAt = new Date();
    if (dto.rememberMe) {
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

    // 6. Injetar Cookie
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: false, // localhost (em produção mude para true e use HTTPS)
      sameSite: 'lax',
      expires: expiresAt,
    });

    // 7. Retornar Usuário e Token para o Front-end
    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        // 💥 CRÍTICO: INCLUIR ESTE CAMPO AQUI para o AuthContext
        onboardingCompleted: user.onboardingCompleted, 
      },
    };
  }

  // --- VERIFICAR EMAIL ---
  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
        where: { verificationToken: token }
    });

    if (!user) throw new NotFoundException('Token de verificação inválido ou expirado.');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
          isVerified: true, 
          verificationToken: null
      }
    });

    return { message: 'E-mail verificado com sucesso! Você já pode fazer login.' };
  }

  // --- RECUPERAÇÃO DE SENHA (Solicitar Código) ---
  async requestPasswordChange(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user) return { message: 'Se o e-mail existir, um código foi enviado.' };

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        resetCode: code,
        resetCodeExpires: expires
      }
    });

    try {
        await this.mailService.sendPasswordResetCode(user.email, code);
    } catch (error) {
      console.error("Erro ao enviar código:", error);
      throw new BadRequestException("Erro ao enviar e-mail. Tente novamente.");
    }

    return { message: 'Código de verificação enviado para seu e-mail.' };
  }

  // --- RECUPERAÇÃO DE SENHA (Confirmar Troca) ---
  async confirmPasswordChange(dto: any) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    
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
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        resetCode: null,
        resetCodeExpires: null
      }
    });

    return { message: 'Senha alterada com sucesso!' };
  }
}