// server/src/modules/project/project.module.ts
import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { PrismaModule } from '../../prisma/prisma.module'; // Importe o Módulo Prisma
import { AuthModule } from '../auth/auth.module'; // Importe o Módulo Auth

@Module({
  imports: [
    PrismaModule, // Adicione para ter acesso ao banco de dados
    AuthModule,   // Adicione para ter acesso aos Guards (ex: JwtAuthGuard)
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  // Se vocês usarem o Padrão Repository, adicionem o ProjectRepository aqui
})
export class ProjectModule {}