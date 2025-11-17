// server/src/modules/social/dto/create-post.dto.ts
import { IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { PostType } from '@prisma/client'; 

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  // O conteúdo é flexível (JSON) para suportar texto, código ou enquetes
  @IsObject()
  @IsNotEmpty()
  content: Record<string, any>; 

  @IsEnum(PostType)
  @IsOptional()
  type?: PostType; // TEXT, CODE_SNIPPET ou POLL (Default é TEXT)

  @IsBoolean()
  @IsOptional()
  isPAP?: boolean; // Se é o "Post de Abertura do Projeto"
}