
// server/src/modules/social/dto/create-post.dto.ts
import { IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsArray } from 'class-validator';
import { PostType } from '@prisma/client'; 
import { ApiProperty } from '@nestjs/swagger'; 

export class CreatePostDto {
  @ApiProperty({
    description: 'Título do post (Opcional - estilo Twitter/Bluesky)',
    example: 'Dúvida sobre React',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'O conteúdo do post',
    example: 'Alguém sabe como centralizar uma div?',
  })
  @IsNotEmpty()
  content: any; // Aceita string ou objeto (flexibilidade para o frontend)

  @ApiProperty({
    description: 'Tipo visual do post',
    enum: PostType,
    example: 'TEXT',
    required: false, 
  })
  @IsEnum(PostType)
  @IsOptional()
  type?: PostType; 

  @ApiProperty({
    description: 'Define se é o Post de Abertura do Projeto (Pitch)',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPAP?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images: string[];
}