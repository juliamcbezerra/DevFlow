import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module'
import { IAuthRepository } from './auth-interface';
import { PrismaAuthRepository } from './database/auth.repository';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, 
    {provide: IAuthRepository, useClass: PrismaAuthRepository},
  ],
})
export class AuthModule {}