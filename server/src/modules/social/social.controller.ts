// server/src/modules/social/social.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  ValidationPipe,
  Get,
  NotFoundException, 
  Patch,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { SocialService } from './social.service';
import { CreatePostDto } from './dto/create-post.dto';
import { VoteDto } from './dto/vote.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtGuard } from '../jwt/jwt.guard';

@Controller() // Prefixo 'projects' para seguir a hierarquia REST
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  //Criar um novo Post
  @UseGuards(JwtGuard)
  @Post('projects/:projectId/posts')
  async createPost(
    @Param('projectId') projectId: string, // Pega o ID da URL
    @Body(ValidationPipe) dto: CreatePostDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.socialService.createPost(dto, userId, projectId);
  }

  //Buscar o Feed do Projeto
  @UseGuards(JwtGuard) // Opcional: Se quiser que o feed seja público, remova esta linha
  @Get('projects/:projectId/posts')
  async findAll(@Param('projectId') projectId: string) {
    return this.socialService.findAllByProject(projectId);
  }

  //Votar/Desvotar num Post
  @UseGuards(JwtGuard)
  @Post('posts/:postId/vote') // Note que a rota começa em 'posts', não 'projects'
  async vote(
    @Param('postId') postId: string,
    @Body(ValidationPipe) dto: VoteDto,
    @Req() req: any,
  ) {
    return this.socialService.toggleVote(req.user.id, postId, dto);
  }

  //Criar um Comentário num Post
  @UseGuards(JwtGuard)
  @Post('posts/:postId/comments')
  async createComment(
    @Param('postId') postId: string,
    @Body(ValidationPipe) dto: CreateCommentDto,
    @Req() req: any,
  ) {
    return this.socialService.createComment(req.user.id, postId, dto);
  }

  //Buscar Comentários de um Post
  @UseGuards(JwtGuard)
  @Get('posts/:postId/comments')
  async getComments(@Param('postId') postId: string) {
    return this.socialService.findCommentsByPost(postId);
  }

  //Buscar um Post pelo ID
  @UseGuards(JwtGuard)
  @Get('posts/:postId')
  async getPost(@Param('postId') postId: string) {
    const post = await this.socialService.findPostById(postId);
    
    if (!post) {
      throw new NotFoundException('Post não encontrado.');
    }

    return post;
  }

  // Atualizar um post
  @UseGuards(JwtGuard)
  @Patch('posts/:postId')
  async update(
    @Param('postId') postId: string,
    @Body(ValidationPipe) dto: UpdatePostDto,
    @Req() req: any,
  ) {
    try {
      return await this.socialService.updatePost(req.user.id, postId, dto);
    } catch (error) {
      // Tratamento de erro simples
      throw new ForbiddenException(error.message);
    }
  }
  // Deletar um post
  @UseGuards(JwtGuard)
  @Delete('posts/:postId')
  async remove(@Param('postId') postId: string, @Req() req: any) {
    try {
      return await this.socialService.removePost(req.user.id, postId);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }
}