import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { VoteDto } from './dto/vote.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class SocialService {
  constructor(private prisma: PrismaService) {}

  // --- POSTS ---
  async createPost(dto: CreatePostDto, userId: string, projectId?: string) {
    const data: any = {
      title: dto.title,
      content: dto.content,
      type: dto.type || 'TEXT',
      author: { connect: { id: userId } },
    };
    if (projectId) data.project = { connect: { id: projectId } };

    return this.prisma.post.create({
      data,
      include: { author: { select: { id: true, name: true, username: true, avatarUrl: true } } }
    });
  }

  async findAllSmart(userId: string, type: 'foryou' | 'following') {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Usuário não encontrado');

    let whereClause: any = { deletedAt: null };

    if (type === 'following') {
      const following = await this.prisma.follows.findMany({ where: { followerId: userId }, select: { followingId: true } });
      const followingIds = following.map(f => f.followingId);
      
      const memberships = await this.prisma.member.findMany({ where: { userId: userId }, select: { projectId: true } });
      const projectIds = memberships.map(m => m.projectId);

      whereClause = {
        deletedAt: null,
        OR: [ { authorId: { in: followingIds } }, { projectId: { in: projectIds } } ]
      };
    }

    const posts = await this.prisma.post.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        author: { select: { id: true, name: true, username: true, avatarUrl: true } },
        project: { select: { id: true, name: true, slug: true, tags: true } },
        votes: { select: { value: true, userId: true } },
        _count: { select: { comments: true } }
      }
    });

    const mappedPosts = posts.map(post => {
      const score = post.votes.reduce((acc, curr) => acc + curr.value, 0);
      const userVote = post.votes.find(v => v.userId === userId)?.value || 0;
      let sortScore = score;
      
      if (type === 'foryou' && post.project && post.project.tags) {
         const matches = post.project.tags.filter(tag => user.interestTags.includes(tag)).length;
         if (matches > 0) sortScore += (matches * 5); 
      }

      const { votes, ...rest } = post;
      return { ...rest, userVote, _count: { comments: post._count.comments, votes: score }, sortScore };
    });

    if (type === 'foryou') return mappedPosts.sort((a, b) => b.sortScore - a.sortScore);
    return mappedPosts;
  }

  async findAllByProject(projectId: string, userId: string) {
    const posts = await this.prisma.post.findMany({
      where: { projectId: projectId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, username: true, avatarUrl: true } },
        project: { select: { id: true, name: true, slug: true } },
        votes: { select: { value: true, userId: true } },
        _count: { select: { comments: true } }
      },
    });

    return posts.map(post => {
        const score = post.votes.reduce((acc, curr) => acc + curr.value, 0);
        const userVote = post.votes.find(v => v.userId === userId)?.value || 0;
        const { votes, ...rest } = post;
        return { ...rest, userVote, _count: { comments: post._count.comments, votes: score } };
    });
  }

  // --- VOTOS (POST E COMENTÁRIO) ---
  
  async toggleVote(userId: string, postId: string, dto: VoteDto) {
    const existingVote = await this.prisma.vote.findUnique({
      where: { userId_postId_commentId: { userId, postId, commentId: "" } }, // Ajuste se seu unique key for diferente
    }).catch(() => null) || await this.prisma.vote.findFirst({ where: { userId, postId } });

    if (existingVote) {
      if (existingVote.value === dto.value) return this.prisma.vote.delete({ where: { id: existingVote.id } });
      return this.prisma.vote.update({ where: { id: existingVote.id }, data: { value: dto.value } });
    }
    return this.prisma.vote.create({ data: { value: dto.value, userId, postId } });
  }

  async toggleCommentVote(userId: string, commentId: string, dto: VoteDto) {
    const existingVote = await this.prisma.vote.findFirst({ where: { userId, commentId } });

    if (existingVote) {
      if (existingVote.value === dto.value) return this.prisma.vote.delete({ where: { id: existingVote.id } });
      return this.prisma.vote.update({ where: { id: existingVote.id }, data: { value: dto.value } });
    }
    return this.prisma.vote.create({ data: { value: dto.value, userId, commentId } });
  }

  // --- COMENTÁRIOS ---

  async createComment(userId: string, postId: string, dto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: {
        content: dto.content,
        postId,
        authorId: userId,
        parentId: dto.parentId || undefined, 
      },
      include: { author: { select: { id: true, name: true, username: true, avatarUrl: true } } }
    });
  }

  async findCommentsByPost(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { id: true, name: true, username: true, avatarUrl: true } },
        votes: { select: { value: true, userId: true } } // Inclui votos
      }
    });
  }

  private buildCommentTree(comments: any[]): any[] {
    const childrenMap = new Map<string | null, any[]>();
    
    // Processa scores antes da árvore
    const processedComments = comments.map(c => {
        const score = c.votes.reduce((acc: number, curr: any) => acc + curr.value, 0);
        return { ...c, score };
    });

    for (const comment of processedComments) {
      const parentId = comment.parentId ?? null;
      if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
      childrenMap.get(parentId)!.push(comment);
    }

    const buildBranch = (parentId: string | null): any[] => {
      const nodes = (childrenMap.get(parentId) ?? []) as any[];
      return nodes.map((comment) => ({
        id: comment.id,
        postId: comment.postId, // Garante que o ID do post vá para o front
        content: comment.content,
        createdAt: comment.createdAt,
        author: comment.author,
        score: comment.score,
        votes: comment.votes, // Envia lista de votos para front saber se user votou
        replies: buildBranch(comment.id)
      }));
    };
    return buildBranch(null);
  }

  async getCommentsTree(postId: string) {
    const comments = await this.findCommentsByPost(postId);
    return this.buildCommentTree(comments);
  }

  // --- UTILITÁRIOS ---

  async findPostById(postId: string, userId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: { select: { id: true, name: true, username: true, avatarUrl: true } },
        project: { select: { id: true, name: true, slug: true } },
        votes: { select: { value: true, userId: true } },
        _count: { select: { comments: true } },
      },
    });

    if (!post) throw new NotFoundException('Post não encontrado');

    const score = post.votes.reduce((acc, curr) => acc + curr.value, 0);
    const userVote = userId ? (post.votes.find(v => v.userId === userId)?.value || 0) : 0;
    const { votes, ...rest } = post;
    
    return { ...rest, userVote, _count: { comments: post._count.comments, votes: score } };
  }

  async updatePost(userId: string, postId: string, dto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error('Post não encontrado');
    if (post.authorId !== userId) throw new Error('Sem permissão');
    return this.prisma.post.update({ where: { id: postId }, data: { title: dto.title, content: dto.content } });
  }

  async removePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error('Post não encontrado');
    if (post.authorId !== userId) throw new Error('Sem permissão');
    return this.prisma.post.update({ where: { id: postId }, data: { deletedAt: new Date() } });
  }
}