// server/src/modules/project/project.module.ts
import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { PrismaModule } from '../../prisma/prisma.module'; 
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [
    PrismaModule, 
    AuthModule,   
  ],
  controllers: [ProjectController],
  providers: [ProjectService],

})
export class ProjectModule {}