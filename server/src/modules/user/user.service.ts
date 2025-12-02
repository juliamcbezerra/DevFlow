import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateInterestsDto } from './dto/update-interests.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // 1. Atualizar Tags de Interesse
  async updateInterests(userId: string, dto: UpdateInterestsDto) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { interestTags: dto.interestTags },
      select: { id: true, name: true, interestTags: true }
    });
  }

  // 2. Atualizar Perfil (Bio, Avatar, Tags)
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
        bannerUrl: dto.bannerUrl,     
        location: dto.location,      
        socialLinks: dto.socialLinks || undefined, 
        interestTags: dto.interestTags
      },
      // Selecione os campos para retornar atualizado
      select: {
        id: true, name: true, username: true, 
        avatarUrl: true, bannerUrl: true, 
        bio: true, location: true, socialLinks: true, 
        interestTags: true
      }
    });
  }

  // 3. Listar Comunidade (Lógica Inteligente)
  async findAllCommunity(userId: string, type: 'foryou' | 'following') {
    
    // ABA SEGUINDO
    if (type === 'following') {
      return this.prisma.user.findMany({
        where: {
          followedBy: { some: { followerId: userId } }
        },
        select: {
          id: true, name: true, username: true, avatarUrl: true, interestTags: true,
          _count: { select: { followedBy: true } }
        }
      });
    }

    // ABA PARA VOCÊ (Recomendação)
    
    // A. Meus dados
    const me = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { following: true }
    });
    
    if (!me) throw new Error("Usuário não encontrado");

    const myFollowingIds = me.following.map(f => f.followingId);
    const myTags = me.interestTags || [];

    // B. Buscar Candidatos (Exclui eu mesmo e quem já sigo)
    const candidates = await this.prisma.user.findMany({
      where: {
        id: { notIn: [userId, ...myFollowingIds] },
      },
      select: {
        id: true, name: true, username: true, avatarUrl: true, interestTags: true,
        // Trazemos quem segue o candidato para achar conexões em comum
        followedBy: { select: { followerId: true } }, 
        _count: { select: { followedBy: true } }
      },
      take: 100 
    });

    // C. Calcular Score
    const scoredUsers = candidates.map(user => {
      let score = 0;

      // Fator 1: Tags em Comum (+10 pts)
      const commonTags = user.interestTags.filter(tag => myTags.includes(tag)).length;
      score += (commonTags * 10);

      // Fator 2: Conexões em Comum (+5 pts)
      // (Pessoas que eu sigo e que também seguem esse usuário)
      const userFollowersIds = user.followedBy.map(f => f.followerId);
      const commonConnections = userFollowersIds.filter(id => myFollowingIds.includes(id)).length;
      score += (commonConnections * 5);

      // Limpeza do objeto de retorno
      const { followedBy, ...userData } = user;

      return {
        ...userData,
        commonTags,       
        commonConnections,
        score
      };
    });

    // D. Ordenar: Maior Score primeiro
    return scoredUsers
      .filter(u => u.score > 0 || scoredUsers.length < 20) // Mostra relevantes ou preenche lista se tiver poucos
      .sort((a, b) => b.score - a.score);
  }

  // 4. Buscar Perfil pelo Username
  async findByUsername(username: string) {
    return await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true, name: true, username: true, avatarUrl: true, bio: true, interestTags: true, createdAt: true, bannerUrl: true, location: true, socialLinks: true,
        _count: {
          select: { followedBy: true, following: true, posts: true, projectsOwned: true }
        },
        posts: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { id: true, content: true, createdAt: true, _count: { select: { votes: true, comments: true } } }
        }
      },
    });
  }
}