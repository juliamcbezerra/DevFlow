import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, Query, ValidationPipe, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { JwtGuard } from '../jwt/jwt.guard';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { PrismaService } from '../../prisma/prisma.service';

@UseGuards(JwtGuard)
@Controller('projects')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly prisma: PrismaService 
  ) {}

  @Post()
  async create(@Body(ValidationPipe) dto: CreateProjectDto, @Req() req: any) {
    return this.projectService.create(req.user.id, dto);
  }

  @Get()
  async findAll(@Req() req: any, @Query('type') type: string) {
    try {
        const listType = type === 'following' ? 'following' : 'foryou';
        return await this.projectService.findAllDirectory(req.user.id, listType);
    } catch (error) {
        console.error("ERRO GET /projects:", error);
        throw new InternalServerErrorException("Erro ao listar projetos.");
    }
  }

  @Get('user/:username')
  async findByUser(@Param('username') username: string) {
     const user = await this.prisma.user.findUnique({ where: { username } });
     if (!user) throw new NotFoundException('Usuário não encontrado');

     return this.prisma.project.findMany({
        where: { ownerId: user.id },
        include: {
            _count: { 
                select: { 
                    members: true, 
                    posts: { where: { deletedAt: null } } // Contagem correta
                } 
            }
        }
     });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.projectService.findOne(id, req.user.id);
  }

  @Post(':id/join')
  async join(@Param('id') id: string, @Req() req: any) {
    return this.projectService.joinProject(id, req.user.id);
  }

  @Delete(':id/leave')
  async leave(@Param('id') id: string, @Req() req: any) {
    return this.projectService.leaveProject(id, req.user.id);
  }
}