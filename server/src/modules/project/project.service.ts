import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  // --- 1. CRIAR ---
  async create(userId: string, dto: CreateProjectDto) {
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);

    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        slug: slug,
        tags: dto.tags || [],
        ownerId: userId,
        members: {
          create: { userId: userId, role: 'OWNER' }
        }
      },
    });
  }

  // --- 2. LISTAR (SMART FEED) ---
  async findAllSmart(userId: string, type: 'foryou' | 'following') {
    // Busca o usuário e seus projetos
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        // Tenta buscar projetos onde sou membro. 
        // Se der erro aqui, é pq o nome da relação no Schema User é diferente de 'members'
        members: true, 
      }
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    let whereClause: any = {};

    // A. SEGUINDO (Projetos que sou membro)
    if (type === 'following') {
      const myProjectIds = user.members.map(m => m.projectId);
      whereClause = { id: { in: myProjectIds } };
    }

    // B. BUSCAR PROJETOS
    const projects = await this.prisma.project.findMany({
      where: whereClause,
      include: {
        _count: { select: { members: true, posts: true } }
      },
      take: 50
    });

    // C. PARA VOCÊ (Ordenação)
    if (type === 'foryou') {
      return projects.map(proj => {
        let score = proj._count.members;
        // Bônus por tags
        if (proj.tags && user.interestTags) {
          const matches = proj.tags.filter(t => user.interestTags.includes(t)).length;
          score += (matches * 50); 
        }
        return { ...proj, sortScore: score };
      }).sort((a, b) => b.sortScore - a.sortScore);
    }

    return projects;
  }

  // --- 3. DETALHES ---
  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { members: true, posts: true } },
        members: { where: { userId: userId }, take: 1 }
      }
    });

    if (!project) throw new NotFoundException('Projeto não encontrado');

    return {
      ...project,
      isMember: project.members.length > 0
    };
  }

  // --- 4. JOIN / LEAVE (Substitui Follow/Unfollow) ---
  async joinProject(projectId: string, userId: string) {
    const existing = await this.prisma.member.findUnique({
       where: { userId_projectId: { userId, projectId } }
    });

    if (existing) return { message: 'Já é membro' };

    await this.prisma.member.create({
      data: { userId, projectId, role: 'MEMBER' }
    });
    return { message: 'Entrou com sucesso' };
  }

  async leaveProject(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (project && project.ownerId === userId) {
        throw new ConflictException('Dono não pode sair.');
    }

    await this.prisma.member.delete({
       where: { userId_projectId: { userId, projectId } }
    });
    return { message: 'Saiu com sucesso' };
  }
}