// server/src/modules/social/social.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { VoteDto } from './dto/vote.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CommentTreeDTO } from './dto/comment-tree.dto';

@Injectable()
export class SocialService {
  constructor(private prisma: PrismaService) {}

  //Criar um novo Post
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

  //Buscar o Feed do Projeto
  async findAllByProject(projectId: string) {
    return this.prisma.post.findMany({
      where: {
        projectId: projectId,
        deletedAt: null, // Filtra pelo projeto atual
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

  //Lógica de Toggle Vote (Upvote/Downvote)
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

  //Criar Comentário
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

  //Listar Comentários de um Post
  async findCommentsByPost(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: { id: true, name: true }
        }
      }
    });
  }

  private buildCommentTree(comments: any[]): CommentTreeDTO[] {
    // Map com array de filhos por parentId
    const childrenMap = new Map<string | null, any[]>();

    for (const comment of comments) {
      const parentId = comment.parentId ?? null;

      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }

      childrenMap.get(parentId)!.push(comment);
    }

    const buildBranch = (parentId: string | null): CommentTreeDTO[] => {
      const nodes = (childrenMap.get(parentId) ?? []) as any[];

      return nodes.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: {
          id: comment.author.id,
          name: comment.author.name
        },
        replies: buildBranch(comment.id)
      }));
    };

    return buildBranch(null);
  }


  async getCommentsTree(postId: string) {
    const comments = await this.findCommentsByPost(postId);
    return this.buildCommentTree(comments);
  }


  //Buscar um Post específico pelo ID
  async findPostById(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
    });

    return post;
  }

async updatePost(userId: string, postId: string, dto: UpdatePostDto) {
    // Primeiro: Verifica se o post existe e pertence ao user
    const post = await this.prisma.post.findUnique({ where: { id: postId } });

    if (!post) throw new Error('Post não encontrado'); // O Controller vai tratar erros melhor depois
    if (post.authorId !== userId) throw new Error('Você não tem permissão para editar este post');

    return this.prisma.post.update({
      where: { id: postId },
      data: {
        title: dto.title,
        content: dto.content,
        // Não permitimos mudar o type ou isPAP por segurança de negócio
      },
    });
  }

  async removePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });

    if (!post) throw new Error('Post não encontrado');
    
    // Regra: Só o Autor OU o Dono do Projeto podem apagar (Futuro: Implementar check de dono do projeto)
    if (post.authorId !== userId) throw new Error('Você não tem permissão para apagar este post');

    return this.prisma.post.update({
      where: { id: postId },
      data: { deletedAt: new Date() }, // Marca a hora da deleção
    });
  }
}
