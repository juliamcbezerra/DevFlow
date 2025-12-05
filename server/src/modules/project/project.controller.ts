import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { ProjectService } from './project.service';
import { JwtGuard } from '../jwt/jwt.guard';
import { CreateProjectDto } from './dto/create-project.dto';

@UseGuards(JwtGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  create(@Body() dto: CreateProjectDto, @Req() req: any) {
    return this.projectService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Req() req: any, @Query('type') type: 'foryou' | 'following') {
    return this.projectService.findAllSmart(req.user.id, type);
  }

  // --- NOVA ROTA PARA PERFIL ---
  @Get('user/:username')
  findByUser(@Param('username') username: string) {
      return this.projectService.findAllByUser(username);
  }
  // -----------------------------

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.projectService.findOne(id, req.user.id);
  }

  @Post(':id/join')
  join(@Param('id') id: string, @Req() req: any) {
    return this.projectService.joinProject(id, req.user.id);
  }

  @Delete(':id/leave')
  leave(@Param('id') id: string, @Req() req: any) {
    return this.projectService.leaveProject(id, req.user.id);
  }
}