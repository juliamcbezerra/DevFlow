import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class GetFeedDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
