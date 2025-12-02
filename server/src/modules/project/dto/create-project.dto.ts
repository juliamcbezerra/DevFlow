import { IsNotEmpty, IsString, IsOptional, IsArray, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Nome do projeto ou comunidade',
    example: 'React Brasil',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Identificador único para URL (apenas letras minúsculas, números e hifens)',
    example: 'react-brasil',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'O identificador deve conter apenas letras minúsculas, números e hifens.',
  })
  slug: string;

  @ApiProperty({
    description: 'Descrição curta do projeto',
    example: 'A maior comunidade de React do Brasil.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Lista de tags relacionadas',
    example: ['frontend', 'react', 'javascript'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'URL da imagem de avatar ou logo',
    example: 'https://github.com/rocketseat.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}