import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; 
import { UpdateInterestsDto } from './dto/update-interests.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async updateInterests(userId: string, dto: UpdateInterestsDto) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        interestTags: dto.interestTags, 
      },
      select: {
        id: true,
        name: true,
        interestTags: true,
      }
    });
  }

  async findAll() {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        interestTags: true,
        // _count: { select: { followedBy: true } } // Descomente se já tiver a relação Follows
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}