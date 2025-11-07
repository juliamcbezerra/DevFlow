// server/src/modules/project/dto/create-project.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString({ message: 'O nome deve ser um texto' })
  @IsNotEmpty({ message: 'O nome não pode estar vazio' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}