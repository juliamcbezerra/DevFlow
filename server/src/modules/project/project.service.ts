// server/src/modules/project/project.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
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

  async followProject(userId: string, projectId: string) {
    // 1. Verifica se o projeto existe
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true }, // sem isPrivate porque não existe no schema
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    // 2. Verifica se o usuário já segue o projeto
    const alreadyFollowing = await this.prisma.followProject.findUnique({
      where: {
        userId_projectId: { userId, projectId },
      },
    });

    if (alreadyFollowing) {
      return {
        status: 'ok',
        message: 'Você já segue este projeto',
      };
    }

    // 3. Cria o follow
    await this.prisma.followProject.create({
      data: { userId, projectId },
    });

    return {
      status: 'ok',
      message: 'Agora você está seguindo este projeto!',
    };
  }

  async unfollowProject(userId: string, projectId: string) {
  // 1. Verifica se o projeto existe
  const project = await this.prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });

  if (!project) {
    throw new NotFoundException('Projeto não encontrado');
  }

  // 2. Verifica se o usuário segue o projeto
  const follow = await this.prisma.followProject.findUnique({
    where: {
      userId_projectId: { userId, projectId },
    },
  });

  if (!follow) {
    return {
      status: 'ok',
      message: 'Você não está seguindo este projeto',
    };
  }

  // 3. Deixa de seguir (remove do banco)
  await this.prisma.followProject.delete({
    where: {
      userId_projectId: { userId, projectId },
    },
  });

  return {
    status: 'ok',
    message: 'Você deixou de seguir este projeto.',
  };
}

  
} // <-- A CLASSE 'ProjectService' TERMINA AQUI