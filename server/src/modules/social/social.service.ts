// server/src/modules/social/social.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class SocialService {
  constructor(private prisma: PrismaService) {}

  /**
   * SOC-01: Criar um novo Post
   */
  async createPost(dto: CreatePostDto, userId: string, projectId: string) {
    // Se for um PAP, verificamos se já existe um (opcional, regra de negócio)
    // Por agora, vamos apenas criar.

    return this.prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content, // O Prisma converte o objeto JS para JSON automaticamente
        type: dto.type,
        isPAP: dto.isPAP || false,
        
        // Conexões (Foreign Keys)
        author: {
          connect: { id: userId },
        },
        project: {
          connect: { id: projectId },
        },
      },
    });
  }
}