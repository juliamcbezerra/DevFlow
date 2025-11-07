// server/src/modules/project/project.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  ValidationPipe,
  Get,
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

    /**
   * ENDPOINT PARA [PROJ-02]: Listar os meus projetos
   * Rota: GET /projects
   */
  @UseGuards(JwtGuard) // 2. REUTILIZE o Guard
  @Get() // 3. É um pedido GET
  async findMyProjects(@Req() req: any) { // 4. REUTILIZE o @Req
    // 5. REUTILIZE a lógica para pegar o ID do utilizador
    const userId = req.user.id;

    if (!userId) {
      throw new Error('ID do utilizador não encontrado no token.');
    }

    // 6. Chame o novo serviço
    return this.projectService.findMyProjects(userId);
  }
  
}