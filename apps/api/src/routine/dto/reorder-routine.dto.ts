import { IsArray, IsUUID } from 'class-validator';

export class ReorderRoutineDto {
  @IsArray()
  @IsUUID('4', { each: true })
  routineIds: string[];
}
