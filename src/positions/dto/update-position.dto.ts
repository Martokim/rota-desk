import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePositionDto {
  @IsOptional()    // every field is optional when updating
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}
