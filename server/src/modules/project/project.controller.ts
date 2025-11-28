import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, Query, ValidationPipe } from '@nestjs/common';
import { JwtGuard } from '../jwt/jwt.guard';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';

@UseGuards(JwtGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // 1. CRIAR PROJETO
  @Post()
  async create(@Body(ValidationPipe) dto: CreateProjectDto, @Req() req: any) {
    // Chama 'create', não 'createProject'
    return this.projectService.create(req.user.id, dto);
  }

  // 2. LISTAR (SMART FEED)
  @Get()
  async findAll(@Req() req: any, @Query('type') type: string) {
    const feedType = type === 'following' ? 'following' : 'foryou';
    // Chama 'findAllSmart', não 'findMyProjects'
    return this.projectService.findAllSmart(req.user.id, feedType);
  }

  // 3. DETALHES
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.projectService.findOne(id, req.user.id);
  }

  // 4. JOIN
  @Post(':id/join')
  async join(@Param('id') id: string, @Req() req: any) {
    // Chama 'joinProject', não 'followProject'
    return this.projectService.joinProject(id, req.user.id);
  }

  // 5. LEAVE
  @Delete(':id/leave')
  async leave(@Param('id') id: string, @Req() req: any) {
    // Chama 'leaveProject', não 'unfollowProject'
    return this.projectService.leaveProject(id, req.user.id);
  }
}