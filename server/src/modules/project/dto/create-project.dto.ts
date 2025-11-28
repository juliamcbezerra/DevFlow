// server/src/modules/project/dto/create-project.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    description: 'O nome do projeto',
    example: 'DevFlow',
  })
  @IsString({ message: 'O nome deve ser um texto' })
  @IsNotEmpty({ message: 'O nome não pode estar vazio' })
  name: string;

  @ApiProperty({
    description: 'Uma breve descrição do objetivo do projeto',
    example: 'Sistema de gestão de tarefas e social para desenvolvedores.',
    required: false, // Marca como opcional na doc
  })
  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}