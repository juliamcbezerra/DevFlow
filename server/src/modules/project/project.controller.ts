// server/src/modules/project/project.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  ValidationPipe,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtGuard } from '../jwt/jwt.guard'; 

@Controller('projects') 
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @UseGuards(JwtGuard) 
  @Post()
  async createProject(
    @Body(ValidationPipe) dto: CreateProjectDto,
    @Req() req: any, 
  ) {

    const userId = req.user.id;

    if (!userId) {
      throw new Error('ID do utilizador não encontrado no token.');
    }
    
    return this.projectService.createProject(dto, userId);
  }

  @UseGuards(JwtGuard) 
  @Get() 
  async findMyProjects(@Req() req: any) { 
    const userId = req.user.id;

    if (!userId) {
      throw new Error('ID do utilizador não encontrado no token.');
    }

    return this.projectService.findMyProjects(userId);
  }

  @UseGuards(JwtGuard)
  @Post(':projectId/follow')
  async followProject(
    @Param('projectId') projectId: string,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.projectService.followProject(userId, projectId);
  }

  @UseGuards(JwtGuard)
  @Delete(':projectId/unfollow')
async unfollowProject(
  @Param('projectId') projectId: string,
  @Req() req,
) {
  const userId = req.user.id;
  return this.projectService.unfollowProject(userId, projectId);
}

}

@UseGuards(JwtGuard)
@Controller('tags')
export class TagsController {
  constructor(private readonly projectService: ProjectService) {}

  @Get('popular')
  async popular() {
    return this.projectService.getPopularTags();
  }
}