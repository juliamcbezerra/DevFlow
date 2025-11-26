// server/src/modules/project/project.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

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
    }); 

    return newProject;
  }

  async findMyProjects(userId: string) {
    // Encontra todos os projetos onde o ownerId é o ID do utilizador
    return this.prisma.project.findMany({
      where: {
        ownerId: userId,
      },
      orderBy: {
        createdAt: 'desc', 
      },
    });
  }
  
}