import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JournalService } from './journal.service';
import { UpsertJournalDto } from './dto/upsert-journal.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('journal')
@UseGuards(JwtAuthGuard)
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Put()
  async upsert(@CurrentUser('id') userId: string, @Body() dto: UpsertJournalDto) {
    const data = await this.journalService.upsert(userId, dto);
    return { success: true, data };
  }

  @Get()
  async findByDate(@CurrentUser('id') userId: string, @Query('date') date: string) {
    const data = await this.journalService.findByDate(userId, date);
    return { success: true, data };
  }

  @Get('monthly')
  async findMonthly(
    @CurrentUser('id') userId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const data = await this.journalService.findMonthly(userId, +year, +month);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.journalService.remove(userId, id);
    return { success: true, data: null };
  }
}
