import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; 

export class CreateCommentDto {
  @ApiProperty({
    description: 'O conteúdo textual do comentário',
    example: 'Sensacional! Mal posso esperar para testar essa feature.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  // --- DESCOMENTADO E ATUALIZADO AQUI 👇 ---
  @ApiProperty({
    description: 'ID do comentário pai (se for uma resposta a outro comentário)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false, 
  })
  @IsOptional()
  @IsString()
  // @IsUUID() // Se quiser validação estrita de UUID, descomente isso
  parentId?: string; 
}