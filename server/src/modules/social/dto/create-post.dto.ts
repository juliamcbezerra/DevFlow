// server/src/modules/social/dto/create-post.dto.ts
import { IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { PostType } from '@prisma/client'; 
import { ApiProperty } from '@nestjs/swagger'; 

export class CreatePostDto {
  @ApiProperty({
    description: 'O título do post',
    example: 'Como centralizar uma div com CSS?',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'O corpo do post em formato JSON. A estrutura depende do tipo.',
    example: { 
      text: 'Alguém sabe se flexbox é melhor que grid para isso?',
      language: 'css' // Exemplo de campo extra se fosse código
    },
  })
  @IsObject()
  @IsNotEmpty()
  content: Record<string, any>; 

  @ApiProperty({
    description: 'O tipo do post (Define como o front renderiza)',
    enum: PostType, // Isso cria um dropdown automático no Swagger!
    example: 'TEXT',
    required: false, // Mostra que é opcional na doc
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
}