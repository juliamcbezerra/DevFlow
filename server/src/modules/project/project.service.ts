import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  // --- 1. CRIAR PROJETO (COMUNIDADE) ---
  async create(userId: string, dto: CreateProjectDto) {
    // 1. Verifica se o Slug já existe (deve ser único)
    const slugExists = await this.prisma.project.findUnique({
      where: { slug: dto.slug }
    });

    if (slugExists) {
      throw new ConflictException('Este identificador (slug) já está em uso por outra comunidade.');
    }

    // 2. Cria o projeto e o membro Owner numa transação implícita
    return this.prisma.project.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        tags: dto.tags || [],
        avatarUrl: dto.avatarUrl,
        ownerId: userId,
        members: {
          create: {
            userId: userId,
            role: 'OWNER'
          }
        }
      },
    });
  }

  // --- 2. LISTAGEM INTELIGENTE (FEED DE PROJETOS) ---
  async findAllSmart(userId: string, type: 'foryou' | 'following') {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        members: true, // Projetos que participo
      }
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    let whereClause: any = {};

    // Lógica "Seguindo" (Projetos que sou membro)
    if (type === 'following') {
      const myProjectIds = user.members.map(m => m.projectId);
      whereClause = { id: { in: myProjectIds } };
    }

    // Busca no banco
    const projects = await this.prisma.project.findMany({
      where: whereClause,
      include: {
        _count: { select: { members: true, posts: true } }
      },
      take: 50 // Paginação simples
    });

    // Lógica "Para Você" (Ordenação por Tags e Popularidade)
    if (type === 'foryou') {
      return projects.map(proj => {
        let score = proj._count.members; // Começa com a popularidade
        
        // Se tiver tags em comum com o usuário, ganha boost
        if (proj.tags && user.interestTags) {
          const matches = proj.tags.filter(t => user.interestTags.includes(t)).length;
          score += (matches * 50); // Peso alto para interesse
        }

        return { ...proj, sortScore: score };
      }).sort((a, b) => b.sortScore - a.sortScore);
    }

    return projects;
  }

  // --- 3. DETALHES DO PROJETO (POR ID OU SLUG) ---
  async findOne(idOrSlug: string, userId: string) {
    // Tenta encontrar por ID (se for UUID) ou por Slug
    const project = await this.prisma.project.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug }
        ]
      },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { members: true, posts: true } },
        // Verifica se o user logado é membro
        members: {
            where: { userId: userId },
            take: 1
        }
      }
    });

    if (!project) throw new NotFoundException('Projeto não encontrado');

    // Retorna flag isMember para facilitar o frontend
    return {
      ...project,
      isMember: project.members.length > 0
    };
  }

  // --- 4. ENTRAR (JOIN) ---
  async joinProject(projectIdOrSlug: string, userId: string) {
    // Primeiro precisamos garantir que temos o ID correto, pois pode vir um slug da URL
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
      data: {
        userId,
        projectId: project.id,
        role: 'MEMBER'
      }
    });
    return { message: 'Entrou com sucesso!' };
  }

  // --- 5. SAIR (LEAVE) ---
  async leaveProject(projectIdOrSlug: string, userId: string) {
    const project = await this.prisma.project.findFirst({
        where: { OR: [{ id: projectIdOrSlug }, { slug: projectIdOrSlug }] },
        select: { id: true, ownerId: true }
    });

    if (!project) throw new NotFoundException('Projeto não encontrado');

    if (project.ownerId === userId) {
        throw new ConflictException('O dono não pode sair do projeto. Transfira a posse ou exclua a comunidade.');
    }

    await this.prisma.member.delete({
       where: { userId_projectId: { userId, projectId: project.id } }
    });
    return { message: 'Saiu com sucesso.' };
  }

  // --- 6. TAGS POPULARES (WIDGETS) ---
  async getPopularTags() {
    try {
        // Query Raw para contar tags dentro de arrays no Postgres
        const rows: any[] = await this.prisma.$queryRaw`
            SELECT tag, COUNT(*)::int AS count
            FROM (
              SELECT UNNEST("tags") AS tag
              FROM "Project"
            ) t
            GROUP BY tag
            ORDER BY count DESC
            LIMIT 10
        `;
        return rows.map(r => ({ tag: r.tag, count: Number(r.count) }));
    } catch (e) {
        console.error("Erro ao buscar tags populares (verifique se o banco suporta unnest)", e);
        return [];
    }
  }
}