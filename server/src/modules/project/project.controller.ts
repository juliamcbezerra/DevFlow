// server/src/modules/project/project.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  ValidationPipe,
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
}