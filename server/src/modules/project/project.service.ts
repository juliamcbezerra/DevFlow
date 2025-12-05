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

  // --- 2. LISTAGEM (DIRECTORY) ---
  async findAllDirectory(userId: string, type: 'foryou' | 'following') {
    let whereClause: any = {};

    if (type === 'following') {
      const memberships = await this.prisma.member.findMany({
        where: { userId: userId },
        select: { projectId: true }
      });
      const projectIds = memberships.map(m => m.projectId);
      whereClause.id = { in: projectIds };
    }

    const projects = await this.prisma.project.findMany({
      where: whereClause,
      include: {
        owner: { select: { name: true, username: true } },
        _count: { 
            select: { 
                members: true, 
                posts: { where: { deletedAt: null } } 
            } 
        }
      },
      orderBy: type === 'following' ? { createdAt: 'desc' } : undefined,
      take: 100
    });

    if (type === 'foryou') {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { interestTags: true }
        });
        const userTags = user?.interestTags || [];

        return projects.map(proj => {
            let score = 0;
            let matchingTags = 0;

            if (proj.tags && userTags.length > 0) {
                matchingTags = proj.tags.filter(tag => userTags.includes(tag)).length;
                score += (matchingTags * 10);
            }
            score += (proj._count.posts * 1);
            score += (proj._count.members * 2);

            return { ...proj, matchingTags, score };
        }).sort((a, b) => b.score - a.score);
    }

    return projects;
  }

  async findAllSmart(userId: string, type: 'foryou' | 'following') {
      return this.findAllDirectory(userId, type);
  }

  // --- NOVO: BUSCAR PROJETOS DE UM USUÁRIO (Para o Perfil) ---
  async findAllByUser(username: string) {
      const user = await this.prisma.user.findUnique({ where: { username } });
      if (!user) throw new NotFoundException("Usuário não encontrado");

      // Busca projetos onde o usuário é membro (Owner ou Member)
      const memberships = await this.prisma.member.findMany({
          where: { userId: user.id },
          include: {
              project: {
                  include: {
                      _count: { select: { members: true, posts: true } }
                  }
              }
          }
      });

      return memberships.map(m => m.project);
  }

  // --- 3. DETALHES COM STAFF ---
  async findOne(idOrSlug: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        owner: { select: { id: true, name: true, username: true, avatarUrl: true } },
        _count: { 
            select: { 
                members: true, 
                posts: { where: { deletedAt: null } } 
            } 
        }
      }
    });

    if (!project) throw new NotFoundException('Projeto não encontrado');

    const membership = await this.prisma.member.findUnique({
        where: { userId_projectId: { userId, projectId: project.id } }
    });

    const staffMembers = await this.prisma.member.findMany({
        where: {
            projectId: project.id,
            role: { in: ['OWNER', 'ADMIN'] }
        },
        include: {
            user: { select: { id: true, name: true, username: true, avatarUrl: true } }
        },
        orderBy: { role: 'desc' } 
    });

    return {
      ...project,
      isMember: !!membership,
      staff: staffMembers.map(m => ({
          ...m.user,
          role: m.role
      }))
    };
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

  async getPopularTags() {
    try {
        const rows: any[] = await this.prisma.$queryRaw`SELECT tag, COUNT(*)::int AS count FROM (SELECT UNNEST("tags") AS tag FROM "Project") t GROUP BY tag ORDER BY count DESC LIMIT 10`;
        return rows.map(r => ({ tag: r.tag, count: Number(r.count) }));
    } catch (e) { return []; }
  }
}