import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { ProjectService } from './project.service';
import { JwtGuard } from '../jwt/jwt.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { Role } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  findAll(@Req() req: any, @Query('type') type: 'foryou' | 'following') {
    return this.projectService.findAllSmart(req.user.id, type);
  }

  @Post('/create')
  create(@Body() dto: CreateProjectDto, @Req() req: any) {
    return this.projectService.create(req.user.id, dto);
  }

  @Get('user/:username')
  findByUser(@Param('username') username: string) {
      return this.projectService.findAllByUser(username);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.projectService.findOne(id, req.user.id);
  }

  // Rotas de Convite
  @Post(':id/invite')
  invite(@Param('id') id: string, @Body() body: { username: string; role: Role }, @Req() req: any) {
    return this.projectService.inviteUser(id, req.user.id, body.username, body.role);
  }

  @Post(':id/accept-invite')
  acceptInvite(@Param('id') id: string, @Body() body: { role: Role }, @Req() req: any) {
    return this.projectService.acceptInvite(req.user.id, id, body.role);
  }

  @Post(':id/join')
  join(@Param('id') id: string, @Req() req: any) {
    return this.projectService.joinProject(id, req.user.id);
  }

  @Delete(':id/leave')
  leave(@Param('id') id: string, @Req() req: any) {
    return this.projectService.leaveProject(id, req.user.id);
  }

  @Get('tags/popular')
  getTags() {
    return this.projectService.getPopularTags();
  }
}