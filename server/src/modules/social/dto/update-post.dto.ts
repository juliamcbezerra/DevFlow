// server/src/modules/social/dto/update-post.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';

// Isto cria um DTO igual ao Create, mas onde title, content e type são opcionais
export class UpdatePostDto extends PartialType(CreatePostDto) {}