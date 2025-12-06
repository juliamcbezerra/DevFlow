import { IsString, IsNotEmpty, IsOptional, IsArray, IsObject } from 'class-validator';

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