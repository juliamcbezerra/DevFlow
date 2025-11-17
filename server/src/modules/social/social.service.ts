// server/src/modules/social/social.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { VoteDto } from './dto/vote.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

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

  /**
   * SOC-02: Buscar o Feed do Projeto
   */
  async findAllByProject(projectId: string) {
    return this.prisma.post.findMany({
      where: {
        projectId: projectId, // Filtra pelo projeto atual
      },
      // Ordenação: Posts mais recentes primeiro (topo da lista)
      orderBy: [
        { isPAP: 'desc' }, // O PAP aparece sempre primeiro (true > false)
        { createdAt: 'desc' } // Depois, os mais novos
      ],
      // Join: Traz os dados do Autor junto com o Post
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            // Não trazemos a senha! Segurança em primeiro lugar.
          },
        },
        _count: {
          select: { 
            comments: true, // Traz a contagem de comentários
            votes: true     // Traz a contagem de votos
          } 
        }
      },
    });
  }
/**
   * SOC-10: Lógica de Toggle Vote (Upvote/Downvote)
   */
  async toggleVote(userId: string, postId: string, dto: VoteDto) {
    // 1. Verificar se já existe um voto deste user neste post
    const existingVote = await this.prisma.vote.findUnique({
      where: {
        userId_postId: { // Chave composta definida no schema
          userId,
          postId,
        },
      },
    });

    // 2. Cenário A: Já votou?
    if (existingVote) {
      // Se votou igual (ex: clicou Upvote num post já Upvoted), removemos (Toggle Off)
      if (existingVote.value === dto.value) {
        return this.prisma.vote.delete({
          where: { id: existingVote.id },
        });
      }

      // Se votou diferente (ex: mudou de Upvote para Downvote), atualizamos
      return this.prisma.vote.update({
        where: { id: existingVote.id },
        data: { value: dto.value },
      });
    }

    // 3. Cenário B: Nunca votou? Criar novo voto.
    return this.prisma.vote.create({
      data: {
        value: dto.value,
        userId,
        postId,
      },
    });
  }

/**
   * SOC-14: Criar Comentário
   */
  async createComment(userId: string, postId: string, dto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: {
        content: dto.content,
        postId,
        authorId: userId,
        // Futuro: parentId: dto.parentId
      },
      include: {
        author: { select: { name: true, id: true } } // Retorna logo o autor para a UI atualizar
      }
    });
  }

  /**
   * SOC-15: Listar Comentários de um Post
   */
  async findCommentsByPost(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' }, // Mais antigos primeiro (ordem cronológica)
      include: {
        author: { select: { name: true, id: true } }
      }
    });
  }
}