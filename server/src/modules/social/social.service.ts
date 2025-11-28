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

  // --- 1. CRIAR POST ---
  async createPost(dto: CreatePostDto, userId: string, projectId?: string) {
    const data: any = {
      title: dto.title,
      content: dto.content,
      type: dto.type || 'TEXT',
      author: { connect: { id: userId } },
    };

    if (projectId) {
      data.project = { connect: { id: projectId } };
    }

    return this.prisma.post.create({
      data,
      include: {
        author: {
          select: { id: true, name: true, username: true, avatarUrl: true }
        }
      }
    });
  }

  // --- 2. FEED INTELIGENTE (Para Você / Seguindo) ---
  async findAllSmart(userId: string, type: 'foryou' | 'following') {
    
    // 1. Pegar dados do usuário atual (tags e quem ele segue)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        following: true,        // Pessoas que ele segue (Tabela Follows)
        followedProjects: true  // Projetos que ele segue (Tabela FollowProject)
      }
    });

    if (!user) throw new Error('Usuário não encontrado');

    let whereClause: any = { deletedAt: null };

    // --- LÓGICA "SEGUINDO" ---
    if (type === 'following') {
      const followingIds = user.following.map(f => f.followingId);
      const projectIds = user.followedProjects.map(p => p.projectId);
      
      whereClause = {
        deletedAt: null,
        OR: [
          { authorId: { in: followingIds } }, // Posts de quem eu sigo
          { projectId: { in: projectIds } }   // Posts de projetos que eu sigo
        ]
      };
    }

    // --- BUSCA DOS POSTS ---
    const posts = await this.prisma.post.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }, // Padrão: mais recentes primeiro
      take: 50, // Paginação inicial
      include: {
        author: { select: { id: true, name: true, username: true, avatarUrl: true } },
        project: { select: { id: true, name: true, tags: true } }, // Traz tags do projeto para o algoritmo
        votes: { select: { value: true } },
        _count: { select: { comments: true } }
      }
    });

    // --- ALGORITMO DE RELEVÂNCIA ---
    const mappedPosts = posts.map(post => {
      // 1. Calcula Score Real (Soma dos Votos)
      let score = post.votes.reduce((acc, curr) => acc + curr.value, 0);
      
      // 2. Cálculo de Peso para ordenação (SortScore)
      // O SortScore começa igual ao Score de votos
      let sortScore = score;

      // Se for "Para Você", aplicamos o algoritmo de recomendação
      if (type === 'foryou' && post.project && post.project.tags) {
         // Quantas tags do projeto batem com as tags do usuário?
         const matches = post.project.tags.filter(tag => user.interestTags.includes(tag)).length;
         
         // BÔNUS: Cada tag em comum vale +5 pontos na ordenação (mas não muda o número visual de votos)
         if (matches > 0) {
            sortScore += (matches * 5); 
         }
      }

      const { votes, ...rest } = post;
      
      return { 
        ...rest, 
        _count: { comments: post._count.comments, votes: score }, // Para o Front exibir
        sortScore // Apenas para ordenar aqui no Back
      };
    });

    // Se for 'foryou', reordenamos baseado na relevância calculada
    if (type === 'foryou') {
      return mappedPosts.sort((a, b) => b.sortScore - a.sortScore);
    }

    // Se for 'following', mantém ordem cronológica
    return mappedPosts;
  }

  // --- 3. FEED DO PROJETO (Mantido) ---
  async findAllByProject(projectId: string) {
    const posts = await this.prisma.post.findMany({
      where: {
        projectId: projectId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, username: true, avatarUrl: true },
        },
        votes: { select: { value: true } },
        _count: {
          select: { comments: true } 
        }
      },
    });

    // Também precisamos calcular o score aqui para não quebrar a UI
    return posts.map(post => {
        const score = post.votes.reduce((acc, curr) => acc + curr.value, 0);
        const { votes, ...rest } = post;
        return { ...rest, _count: { comments: post._count.comments, votes: score } };
    });
  }

  // --- 4. TOGGLE VOTE ---
  async toggleVote(userId: string, postId: string, dto: VoteDto) {
    const existingVote = await this.prisma.vote.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existingVote) {
      if (existingVote.value === dto.value) {
        return this.prisma.vote.delete({ where: { id: existingVote.id } });
      }
      return this.prisma.vote.update({
        where: { id: existingVote.id },
        data: { value: dto.value },
      });
    }

    return this.prisma.vote.create({
      data: { value: dto.value, userId, postId },
    });
  }

  // --- 5. COMENTÁRIOS ---
  async createComment(userId: string, postId: string, dto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: {
        content: dto.content,
        postId,
        authorId: userId,
      },
      include: {
        author: { select: { id: true, name: true, username: true, avatarUrl: true } }
      }
    });
  }

  async findCommentsByPost(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { id: true, name: true, username: true, avatarUrl: true } }
      }
    });
  }

  private buildCommentTree(comments: any[]): CommentTreeDTO[] {
    const childrenMap = new Map<string | null, any[]>();

    for (const comment of comments) {
      const parentId = comment.parentId ?? null;
      if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
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
          name: comment.author.name,
          avatarUrl: comment.author.avatarUrl 
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

  // --- 6. UTILITÁRIOS ---
  async findPostById(postId: string) {
    return this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: { select: { id: true, name: true, username: true, avatarUrl: true } },
        votes: { select: { value: true } },
        _count: { select: { comments: true } },
      },
    });
  }

  async updatePost(userId: string, postId: string, dto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error('Post não encontrado');
    if (post.authorId !== userId) throw new Error('Sem permissão');

    return this.prisma.post.update({
      where: { id: postId },
      data: { title: dto.title, content: dto.content },
    });
  }

  async removePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error('Post não encontrado');
    if (post.authorId !== userId) throw new Error('Sem permissão');

    return this.prisma.post.update({
      where: { id: postId },
      data: { deletedAt: new Date() },
    });
  }
}