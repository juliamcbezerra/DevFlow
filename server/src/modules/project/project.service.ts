// server/src/modules/project/project.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectService {
  // Injete o PrismaService para falar com o banco
  constructor(private prisma: PrismaService) {}

  /**
   * Lógica para [PROJ-01]
   * @param dto Os dados do novo projeto (nome, descrição)
   * @param userId O ID do utilizador logado (vem do token JWT)
   */
  async createProject(dto: CreateProjectDto, userId: string) {
    // 1. Cria o projeto no banco
    const newProject = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        
        // 2. Conecta o projeto ao seu dono (owner)
        owner: {
          connect: {
            id: userId,
          },
        },
      },
    }); // <-- O 'create' do Prisma termina aqui

    return newProject;
  } // <-- A FUNÇÃO 'createProject' TERMINA AQUI

  /**
   * LÓGICA PARA [PROJ-02] (É SÓ ISTO!)
   * @param userId O ID do utilizador logado (vem do token JWT)
  */
  async findMyProjects(userId: string) {
    // Encontra todos os projetos onde o ownerId é o ID do utilizador
    return this.prisma.project.findMany({
      where: {
        ownerId: userId,
      },
      orderBy: {
        createdAt: 'desc', // Opcional: mostra os mais novos primeiro
      },
    });
  }
  
} // <-- A CLASSE 'ProjectService' TERMINA AQUI