// server/src/modules/social/dto/vote.dto.ts
import { IsInt, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VoteDto {
  @ApiProperty({
    description: 'O valor do voto. 1 representa Upvote (positivo), -1 representa Downvote (negativo).',
    example: 1,
    enum: [1, -1], // Cria um dropdown na UI do Swagger!
  })
  @IsInt()
  @IsIn([1, -1], { message: 'O valor deve ser 1 (Upvote) ou -1 (Downvote)' })
  value: number;
}