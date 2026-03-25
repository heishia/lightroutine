import { IsString, IsIn, IsArray, ArrayMinSize, MaxLength, IsOptional } from 'class-validator';

const TIME_SLOTS = ['MORNING', 'AFTERNOON', 'EVENING'] as const;
const CATEGORIES = ['HEALTH', 'EXERCISE', 'STUDY', 'LIFESTYLE', 'WORK', 'OTHER'] as const;
const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;

export class UpdateRoutineDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsIn(CATEGORIES)
  category?: string;

  @IsOptional()
  @IsIn(TIME_SLOTS)
  timeSlot?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(WEEKDAYS, { each: true })
  repeatDays?: string[];
}
