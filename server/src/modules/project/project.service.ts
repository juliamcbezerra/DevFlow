import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { NotificationType, Role } from '@prisma/client';

@Injectable()
export class ProjectService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService
  ) {}

  // --- 1. CRIAR ---
  async create(userId: string, dto: CreateProjectDto) {
    const slugExists = await this.prisma.project.findUnique({ where: { slug: dto.slug } });
    if (slugExists) throw new ConflictException('Slug já em uso.');

    return this.prisma.project.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        tags: dto.tags || [],
        avatarUrl: dto.avatarUrl,
        bannerUrl: dto.bannerUrl,
        ownerId: userId,
        members: { create: { userId: userId, role: 'OWNER' } }
      },
    });
  }

  // --- 2. LISTAGEM ---
  async findAllDirectory(userId: string, type: 'foryou' | 'following') {
    let whereClause: any = {};
    if (type === 'following') {
      const memberships = await this.prisma.member.findMany({ where: { userId }, select: { projectId: true } });
      whereClause.id = { in: memberships.map(m => m.projectId) };
    }

    const projects = await this.prisma.project.findMany({
      where: whereClause,
      include: {
        owner: { select: { name: true, username: true } },
        _count: { select: { members: true, posts: { where: { deletedAt: null } } } }
      },
      orderBy: type === 'following' ? { createdAt: 'desc' } : undefined,
      take: 100
    });

    if (type === 'foryou') {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { interestTags: true } });
        const userTags = user?.interestTags || [];
        return projects.map(proj => {
            let score = 0, matchingTags = 0;
            if (proj.tags && userTags.length > 0) {
                matchingTags = proj.tags.filter(tag => userTags.includes(tag)).length;
                score += (matchingTags * 10);
            }
            score += (proj._count.posts * 1) + (proj._count.members * 2);
            return { ...proj, matchingTags, score };
        }).sort((a, b) => b.score - a.score);
    }
    return projects;
  }

  async findAllSmart(userId: string, type: 'foryou' | 'following') { return this.findAllDirectory(userId, type); }

  async findAllByUser(username: string) {
      const user = await this.prisma.user.findUnique({ where: { username } });
      if (!user) throw new NotFoundException("Usuário não encontrado");
      const memberships = await this.prisma.member.findMany({
          where: { userId: user.id },
          include: { project: { include: { _count: { select: { members: true, posts: true } } } } }
      });
      return memberships.map(m => m.project);
  }

  // --- 3. DETALHES COM GRUPOS (ESTILO DISCORD) ---
  async findOne(idOrSlug: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        owner: { select: { id: true, name: true, username: true, avatarUrl: true } },
        _count: { select: { members: true, posts: { where: { deletedAt: null } } } }
      }
    });

    if (!project) throw new NotFoundException('Projeto não encontrado');

    // Busca TODOS os membros
    const allMembers = await this.prisma.member.findMany({
        where: { projectId: project.id },
        include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } } },
        orderBy: { joinedAt: 'asc' } // Membros antigos primeiro
    });

    // Agrupa para Sidebar
    const groupedMembers = {
        owner: allMembers.filter(m => m.role === 'OWNER'),
        developers: allMembers.filter(m => m.role === 'ADMIN'),
        members: allMembers.filter(m => m.role === 'MEMBER'),
    };

    const myMembership = allMembers.find(m => m.userId === userId);

    return {
      ...project,
      isMember: !!myMembership,
      myRole: myMembership?.role || null,
      groupedMembers // Retorna a lista organizada
    };
  }

  // --- 4. CONVITE ---
  async inviteUser(projectId: string, senderId: string, targetUsername: string, role: Role) {
      const senderMember = await this.prisma.member.findUnique({ where: { userId_projectId: { userId: senderId, projectId } } });
      if (!senderMember || senderMember.role === 'MEMBER') throw new ForbiddenException('Sem permissão.');

      const targetUser = await this.prisma.user.findUnique({ where: { username: targetUsername } });
      if (!targetUser) throw new NotFoundException('Usuário não encontrado.');

      const existing = await this.prisma.member.findUnique({ where: { userId_projectId: { userId: targetUser.id, projectId } } });
      if (existing) throw new ConflictException('Usuário já é membro.');

      const project = await this.prisma.project.findUnique({ where: { id: projectId } });
      
      const roleLabel = role === 'ADMIN' ? 'Desenvolvedor' : 'Membro';
      await this.notificationService.createAndSend(
          targetUser.id,
          `Convite para ser ${roleLabel} em ${project?.name}`,
          NotificationType.INVITE,
          senderId,
          projectId,
          role
      );
      return { message: 'Convite enviado.' };
  }

  async acceptInvite(userId: string, projectId: string, role: Role) {
      const existing = await this.prisma.member.findUnique({ where: { userId_projectId: { userId, projectId } } });
      if (!existing) {
          await this.prisma.member.create({ data: { userId, projectId, role } });
      }
      return { success: true };
  }

  // --- 5. JOIN / LEAVE ---
  async joinProject(projectIdOrSlug: string, userId: string) {
    const project = await this.prisma.project.findFirst({ where: { OR: [{ id: projectIdOrSlug }, { slug: projectIdOrSlug }] }, select: { id: true } });
    if (!project) throw new NotFoundException('Projeto não encontrado');
    
    const existing = await this.prisma.member.findUnique({ where: { userId_projectId: { userId, projectId: project.id } } });
    if (existing) return { message: 'Já membro.' };

    await this.prisma.member.create({ data: { userId, projectId: project.id, role: 'MEMBER' } });
    return { message: 'Entrou com sucesso!' };
  }

  async leaveProject(projectIdOrSlug: string, userId: string) {
    const project = await this.prisma.project.findFirst({ where: { OR: [{ id: projectIdOrSlug }, { slug: projectIdOrSlug }] }, select: { id: true, ownerId: true } });
    if (!project) throw new NotFoundException('Projeto não encontrado');
    if (project.ownerId === userId) throw new ConflictException('Dono não pode sair.');

    await this.prisma.member.delete({ where: { userId_projectId: { userId, projectId: project.id } } });
    return { message: 'Saiu.' };
  }

  // Deletar projeto (apenas o dono)
  async deleteProject(projectIdOrSlug: string, userId: string) {
    const project = await this.prisma.project.findFirst({ 
      where: { OR: [{ id: projectIdOrSlug }, { slug: projectIdOrSlug }] }, 
      select: { id: true, ownerId: true } 
    });
    
    if (!project) throw new NotFoundException('Projeto não encontrado');
    if (project.ownerId !== userId) throw new ForbiddenException('Apenas o dono pode deletar este projeto');

    // Deleta membros primeiro, depois o projeto
    await this.prisma.member.deleteMany({ where: { projectId: project.id } });
    await this.prisma.project.delete({ where: { id: project.id } });
    
    return { message: 'Projeto deletado com sucesso' };
  }

async getPopularTags() {
    try {
        // SQL Raw para "explodir" o array de tags, contar e agrupar
        // O ::int é necessário porque o COUNT retorna BigInt que o JSON não serializa nativamente
        const rows: any[] = await this.prisma.$queryRaw`
            SELECT tag, CAST(COUNT(*) AS INTEGER) as count 
            FROM (SELECT UNNEST("tags") AS tag FROM "Project") t 
            GROUP BY tag 
            ORDER BY count DESC 
            LIMIT 10
        `;
        return rows;
    } catch (e) {
        console.error("Erro ao buscar tags populares:", e);
        return [];
    }
  }

async update(id: string, userId: string, dto: UpdateProjectDto) {
  const project = await this.prisma.project.findUnique({ where: { id } });

  if (!project) {
    throw new NotFoundException('Projeto não encontrado');
  }

  if (project.ownerId !== userId) {
    throw new ForbiddenException('Apenas o dono pode editar este projeto');
  }

  return this.prisma.project.update({
    where: { id },
    data: {
      ...dto,
    },
  });
  }

  // --- MEMBROS ---
  async getMembers(projectIdOrSlug: string) {
    const project = await this.prisma.project.findFirst({
      where: { OR: [{ id: projectIdOrSlug }, { slug: projectIdOrSlug }] },
      select: { id: true }
    });

    if (!project) throw new NotFoundException('Projeto não encontrado');

    const members = await this.prisma.member.findMany({
      where: { projectId: project.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true
          }
        }
      },
      orderBy: [{ role: 'asc' }]
    });

    return members.map(m => ({
      id: m.user.id,
      name: m.user.name,
      username: m.user.username,
      avatarUrl: m.user.avatarUrl,
      role: m.role
    }));
  }

  async removeMember(projectIdOrSlug: string, requestUserId: string, memberId: string) {
    const project = await this.prisma.project.findFirst({
      where: { OR: [{ id: projectIdOrSlug }, { slug: projectIdOrSlug }] },
      select: { id: true, ownerId: true }
    });

    if (!project) throw new NotFoundException('Projeto não encontrado');
    if (project.ownerId !== requestUserId) {
      throw new ForbiddenException('Apenas o dono pode remover membros');
    }

    const member = await this.prisma.member.findUnique({
      where: { userId_projectId: { userId: memberId, projectId: project.id } }
    });

    if (!member) throw new NotFoundException('Membro não encontrado neste projeto');
    if (member.role === 'OWNER') throw new ConflictException('Não é possível remover o dono do projeto');

    await this.prisma.member.delete({
      where: { userId_projectId: { userId: memberId, projectId: project.id } }
    });

    return { message: 'Membro removido com sucesso' };
  }
}
