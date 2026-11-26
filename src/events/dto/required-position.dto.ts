import { IsInt, IsMongoId, Min } from 'class-validator';
export class RequiredPositionDto {
  @IsMongoId()
  position: string;

  @IsInt()
  @Min(1)
  slots: number;
}
