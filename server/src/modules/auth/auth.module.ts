import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { IAuthRepository } from './auth-interface';
import { PrismaAuthRepository } from './database/auth.repository';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../jwt/jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),  
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {provide: IAuthRepository, useClass: PrismaAuthRepository},
  ],
})
export class AuthModule {}