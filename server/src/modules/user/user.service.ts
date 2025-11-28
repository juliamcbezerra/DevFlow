import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateInterestsDto } from './dto/update-interests.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // 1. Atualizar Tags de Interesse
  async updateInterests(userId: string, dto: UpdateInterestsDto) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { interestTags: dto.interestTags },
      select: {
        id: true,
        name: true,
        interestTags: true,
      }
    });
  }

  // 2. Listar Todos (Para a página Comunidade)
  async findAll() {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        interestTags: true,
        _count: {
          select: { followedBy: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // 3. Buscar Perfil pelo Username (Para a página Perfil)
  async findByUsername(username: string) {
    return await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        bio: true,
        interestTags: true,
        createdAt: true,
        _count: {
          select: {
            followedBy: true, // Seguidores
            following: true,  // Seguindo
            posts: true,      // Qtd Posts
          }
        },
        // Traz os últimos 10 posts desse usuário
        posts: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
            _count: {
              select: { votes: true, comments: true }
            }
          }
        }
      },
    });
  }
}