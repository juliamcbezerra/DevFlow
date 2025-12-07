// server/src/modules/project/dto/create-project.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsUrl, IsArray, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;
  
  @ApiProperty({
    description: 'URL do banner do projeto',
    example: 'https://meu-bucket-s3.amazonaws.com/banner-123.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'A imagem do projeto deve ser uma URL válida' })
  bannerImage?: string;

  @ApiProperty({
    description: 'URL da imagem do projeto',
    example: 'https://meu-bucket-s3.amazonaws.com/project-123.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'A imagem do projeto deve ser uma URL válida' })
  projectImage?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  avatarUrl?: string;
  
  @IsString()
  @IsOptional()
  bannerUrl?: string;

  @IsOptional()
  socialLinks?: {
    github?: string;
    discord?: string;
    website?: string;
  };
}