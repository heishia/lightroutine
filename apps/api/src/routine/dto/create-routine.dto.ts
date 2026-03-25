import { IsString, IsIn, IsArray, ArrayMinSize, MaxLength } from 'class-validator';

const TIME_SLOTS = ['MORNING', 'AFTERNOON', 'EVENING'] as const;
const CATEGORIES = ['HEALTH', 'EXERCISE', 'STUDY', 'LIFESTYLE', 'WORK', 'OTHER'] as const;
const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;

export class CreateRoutineDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsIn(CATEGORIES)
  category!: string;

  @IsIn(TIME_SLOTS)
  timeSlot!: string;

  @IsString()
  color!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsIn(WEEKDAYS, { each: true })
  repeatDays!: string[];
}
