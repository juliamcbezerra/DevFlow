// server/src/modules/social/dto/vote.dto.ts
import { IsInt, IsIn } from 'class-validator';

export class VoteDto {
  @IsInt()
  @IsIn([1, -1], { message: 'O valor deve ser 1 (Upvote) ou -1 (Downvote)' })
  value: number;
}