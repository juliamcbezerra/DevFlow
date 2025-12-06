import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from 'class-validator';

export class UpdateInterestsDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(3) 
  interestTags: string[]; 
}