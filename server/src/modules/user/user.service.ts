import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateInterestsDto } from './dto/update-interests.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { NotificationService } from '../notification/notification.service'; 

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService // <--- Injeção
  ) {}

  // 1. Atualizar Tags de Interesse
  async updateInterests(userId: string, dto: UpdateInterestsDto) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { interestTags: dto.interestTags },
      select: { id: true, name: true, interestTags: true }
    });
  }

  // 2. Atualizar Perfil (Geral)
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // Certifique-se de que a rota PATCH /users/me não altere o onboardingCompleted
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
        bannerUrl: dto.bannerUrl, 
        location: dto.location, 
        socialLinks: dto.socialLinks || undefined, 
        interestTags: dto.interestTags
      },
      select: {
        id: true, name: true, username: true, 
        avatarUrl: true, bannerUrl: true, 
        bio: true, location: true, socialLinks: true, 
        interestTags: true,
        onboardingCompleted: true, // Incluído para consistência com o retorno do finishOnboarding
      }
    });
  }

  // 💥 3. Finalizar Onboarding (NOVO MÉTODO)
  // Esta rota é chamada pelo Front-end em PATCH /users/me/onboarding
  async finishOnboarding(userId: string, dto: UpdateProfileDto) {
    
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name, // O nome pode ser preenchido/alterado no onboarding
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
        bannerUrl: dto.bannerUrl, 
        location: dto.location, 
        socialLinks: dto.socialLinks || undefined, 
        interestTags: dto.interestTags,
        
        // 💥 CRUCIAL: Marca a conclusão
        onboardingCompleted: true, 
      },
      select: {
        id: true, name: true, username: true, 
        avatarUrl: true, bannerUrl: true, 
        bio: true, location: true, socialLinks: true, 
        interestTags: true,
        onboardingCompleted: true, // Retorna a flag TRUE
      }
    });
    
    return updatedUser;
  }


  // 4. Listar Comunidade (Numeração ajustada)
  async findAllCommunity(userId: string, type: 'foryou' | 'following') {
    if (type === 'following') {
      return this.prisma.user.findMany({
        where: { followedBy: { some: { followerId: userId } } },
        select: { id: true, name: true, username: true, avatarUrl: true, interestTags: true, _count: { select: { followedBy: true } } }
      });
    }

    const me = await this.prisma.user.findUnique({ where: { id: userId }, include: { following: true } });
    if (!me) throw new Error("Usuário não encontrado");

    const myFollowingIds = me.following.map(f => f.followingId);
    const myTags = me.interestTags || [];

    const candidates = await this.prisma.user.findMany({
      where: { id: { notIn: [userId, ...myFollowingIds] } },
      select: {
        id: true, name: true, username: true, avatarUrl: true, interestTags: true,
        followedBy: { select: { followerId: true } }, 
        _count: { select: { followedBy: true } }
      },
      take: 100 
    });

    const scoredUsers = candidates.map(user => {
      let score = 0;
      const commonTags = user.interestTags.filter(tag => myTags.includes(tag)).length;
      score += (commonTags * 10);
      const userFollowersIds = user.followedBy.map(f => f.followerId);
      const commonConnections = userFollowersIds.filter(id => myFollowingIds.includes(id)).length;
      score += (commonConnections * 5);
      const { followedBy, ...userData } = user;
      return { ...userData, commonTags, commonConnections, score };
    });

    return scoredUsers.filter(u => u.score > 0 || scoredUsers.length < 20).sort((a, b) => b.score - a.score);
  }

  // 5. Buscar Perfil (Numeração ajustada)
  async findByUsername(username: string, currentUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true, name: true, username: true, avatarUrl: true, bio: true, interestTags: true, createdAt: true, bannerUrl: true, location: true, socialLinks: true, onboardingCompleted: true, // 💡 Incluído aqui também
        _count: { select: { followedBy: true, following: true, posts: true, projectsOwned: true } },
        followedBy: currentUserId ? { where: { followerId: currentUserId } } : false,
        posts: {
          take: 5, orderBy: { createdAt: 'desc' },
          select: { id: true, content: true, createdAt: true, _count: { select: { votes: true, comments: true } } }
        }
      },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    // Acessa o campo `onboardingCompleted` para retorno
    const isFollowing = currentUserId && Array.isArray(user.followedBy) ? user.followedBy.length > 0 : false;
    const isMe = currentUserId === user.id;
    const { followedBy, ...rest } = user;

    return { ...rest, isFollowing, isMe };
  }

  // 6. Seguir / Deixar de Seguir (Com Notificação) (Numeração ajustada)
  async toggleFollow(followerId: string, targetUsername: string) {
    const targetUser = await this.prisma.user.findUnique({ where: { username: targetUsername } });
    if (!targetUser) throw new NotFoundException('Usuário não encontrado');
    if (followerId === targetUser.id) throw new BadRequestException('Não pode seguir a si mesmo');

    const existingFollow = await this.prisma.follows.findUnique({
      where: { followerId_followingId: { followerId, followingId: targetUser.id } },
    });

    if (existingFollow) {
      await this.prisma.follows.delete({
        where: { followerId_followingId: { followerId, followingId: targetUser.id } },
      });
      return { isFollowing: false };
    } else {
      await this.prisma.follows.create({
        data: { followerId, followingId: targetUser.id },
      });

      // --- Notificação ---
      const follower = await this.prisma.user.findUnique({ where: { id: followerId } });
      if (follower) {
          await this.notificationService.createAndSend(
              targetUser.id,
              `${follower.name} começou a te seguir.`,
              'FOLLOW',
              followerId
          );
      }
      return { isFollowing: true };
    }
  }

  // 7. Buscar Seguidores (Numeração ajustada)
  async getFollowers(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true }
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    const followers = await this.prisma.follows.findMany({
      where: { followingId: user.id },
      select: {
        follower: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            interestTags: true,
            bannerUrl: true,
            location: true,
            _count: { select: { followedBy: true } }
          }
        }
      }
    });

    return followers.map(f => f.follower);
  }

  // 8. Buscar Seguindo (Numeração ajustada)
  async getFollowing(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true }
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    const following = await this.prisma.follows.findMany({
      where: { followerId: user.id },
      select: {
        following: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            interestTags: true,
            bannerUrl: true,
            location: true,
            _count: { select: { followedBy: true } }
          }
        }
      }
    });

    return following.map(f => f.following);
  }
}