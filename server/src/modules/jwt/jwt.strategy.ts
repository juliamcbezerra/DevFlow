// server/src/modules/auth/jwt/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          // 1. Extrai o token do cookie
          return req?.cookies?.access_token || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'defaultSecret',
      passReqToCallback: true, // 2. Precisamos de passar o 'req' para o validate
    });
  }

  async validate(req: Request, payload: any) {
    // 3. Verifica se o utilizador do token existe
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Utilizador não encontrado');
    }

    // Pega o token do cookie
    const accessToken = req.cookies.access_token;
    
    // Procura uma sessão ativa no banco com este token
    const session = await this.prisma.session.findUnique({
      where: {
        accessToken: accessToken,
      },
    });

    if (!session) {
      // Se não há sessão, o token não é mais válido (ex: o utilizador fez logout)
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }

    // 5. Se tudo estiver correto, retorna os dados do utilizador
    return { id: user.id, email: user.email, sub: user.id };
  }
}