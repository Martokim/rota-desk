import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePositionDto {
  @IsString()      // must be text
  @IsNotEmpty()    // cannot be empty
  @MaxLength(50)
  name: string;

  @IsOptional()    // may be missing
  @IsString()
  @MaxLength(200)
  description?: string;
}
