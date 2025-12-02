import { IsString, IsOptional, IsArray, IsObject } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  // --- NOVOS ---
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsObject()
  socialLinks?: Record<string, string>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interestTags?: string[];
}