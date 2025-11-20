// server/src/modules/social/dto/create-comment.dto.ts
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; 

export class CreateCommentDto {
  @ApiProperty({
    description: 'O conteúdo textual do comentário',
    example: 'Sensacional! Mal posso esperar para testar essa feature.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  /*
  @ApiProperty({
    description: 'ID do comentário pai (se for uma resposta a outro comentário)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false, // Marca como opcional no Swagger
  })
  @IsOptional()
  @IsString()
  parentId?: string; 
  */
}