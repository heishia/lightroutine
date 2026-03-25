import { IsString, IsDateString, MaxLength, MinLength } from 'class-validator';

export class UpsertJournalDto {
  @IsDateString()
  entryDate!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10)
  mood!: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(5000)
  content!: string;
}
