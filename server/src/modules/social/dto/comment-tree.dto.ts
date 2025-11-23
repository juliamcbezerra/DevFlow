import { ApiProperty } from '@nestjs/swagger';

export class CommentAuthorDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string | null;
}

export class CommentTreeDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: () => CommentAuthorDTO })
  author: CommentAuthorDTO;

  @ApiProperty({ type: () => [CommentTreeDTO] })
  replies: CommentTreeDTO[];
}
