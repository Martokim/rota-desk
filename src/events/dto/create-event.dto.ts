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

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  // Description
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  // Dates
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;

  // Location
  @IsString()
  @IsNotEmpty()
  location: string;

  // Required positions
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequiredPositionDto)
  requiredPositions: RequiredPositionDto[];
}
