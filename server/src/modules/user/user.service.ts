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
        interestTags: true, // Retorna as tags atualizadas
      }
    });
  }
}