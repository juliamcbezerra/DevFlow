import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  // --- 1. CRIAR PROJETO ---
  async create(userId: string, dto: CreateProjectDto) {
    const slugExists = await this.prisma.project.findUnique({
      where: { slug: dto.slug }
    });

    if (slugExists) {
      throw new ConflictException('Este identificador (slug) já está em uso.');
    }

    return this.prisma.project.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        tags: dto.tags || [],
        avatarUrl: dto.avatarUrl,
        ownerId: userId,
        members: {
          create: { userId: userId, role: 'OWNER' }
        }
      },
    });
  }

  // --- 2. LISTAGEM DE PROJETOS (CORRIGIDO) ---
  async findAllDirectory(userId: string, type: 'foryou' | 'following') {
    
    // CORREÇÃO: Começamos com filtro vazio (sem deletedAt, pois pode não existir no banco)
    let whereClause: any = {};

    // Lógica SEGUINDO (Projetos que participo)
    if (type === 'following') {
      const memberships = await this.prisma.member.findMany({
        where: { userId: userId },
        select: { projectId: true }
      });
      const projectIds = memberships.map(m => m.projectId);
      
      whereClause.id = { in: projectIds };
    }

    // Busca Projetos
    const projects = await this.prisma.project.findMany({
      where: whereClause,
      include: {
        owner: { select: { name: true, username: true } },
        _count: { select: { members: true, posts: true } }
      },
      // Ordenação segura
      orderBy: type === 'following' ? { createdAt: 'desc' } : undefined,
      take: 100
    });

    // Lógica PARA VOCÊ (Recomendação)
    if (type === 'foryou') {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { interestTags: true }
        });
        const userTags = user?.interestTags || [];

        return projects.map(proj => {
            let score = 0;
            let matchingTags = 0;

            // Pontua se tiver tags em comum
            if (proj.tags && userTags.length > 0) {
                matchingTags = proj.tags.filter(tag => userTags.includes(tag)).length;
                score += (matchingTags * 10);
            }

            // Pontua por popularidade
            score += (proj._count.posts * 1);
            score += (proj._count.members * 2);

            return { ...proj, matchingTags, score };
        }).sort((a, b) => b.score - a.score);
    }

    return projects;
  }

  // Compatibilidade
  async findAllSmart(userId: string, type: 'foryou' | 'following') {
      return this.findAllDirectory(userId, type);
  }

  // --- 3. DETALHES ---
  async findOne(idOrSlug: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { members: true, posts: true } },
        members: { where: { userId: userId }, take: 1 }
      }
    });

    if (!project) throw new NotFoundException('Projeto não encontrado');

    return { ...project, isMember: project.members.length > 0 };
  }

  // --- 4. JOIN / LEAVE ---
  async joinProject(projectIdOrSlug: string, userId: string) {
    const project = await this.prisma.project.findFirst({
        where: { OR: [{ id: projectIdOrSlug }, { slug: projectIdOrSlug }] },
        select: { id: true }
    });
    if (!project) throw new NotFoundException('Projeto não encontrado');

    const existing = await this.prisma.member.findUnique({
       where: { userId_projectId: { userId, projectId: project.id } }
    });
    if (existing) return { message: 'Você já é membro.' };

    await this.prisma.member.create({
      data: { userId, projectId: project.id, role: 'MEMBER' }
    });
    return { message: 'Entrou com sucesso!' };
  }

  async leaveProject(projectIdOrSlug: string, userId: string) {
    const project = await this.prisma.project.findFirst({
        where: { OR: [{ id: projectIdOrSlug }, { slug: projectIdOrSlug }] },
        select: { id: true, ownerId: true }
    });
    if (!project) throw new NotFoundException('Projeto não encontrado');

    if (project.ownerId === userId) {
        throw new ConflictException('O dono não pode sair do projeto.');
    }

    await this.prisma.member.delete({
       where: { userId_projectId: { userId, projectId: project.id } }
    });
    return { message: 'Saiu com sucesso.' };
  }
}