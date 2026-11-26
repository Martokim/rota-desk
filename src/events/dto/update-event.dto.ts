import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RequiredPositionDto } from './required-position.dto';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title?: string;

  // Description
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  //dates
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  // location
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  location?: string;

  // Required positions
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequiredPositionDto)
  requiredPositions?: RequiredPositionDto[];
}
