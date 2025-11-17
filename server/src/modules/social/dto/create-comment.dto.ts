// server/src/modules/social/dto/create-comment.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  // Opcional: parentId (para respostas aninhadas no futuro/SOC-16)
  // @IsOptional()
  // @IsString()
  // parentId?: string; 
}