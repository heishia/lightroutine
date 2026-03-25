import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RoutineService } from './routine.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { ReorderRoutineDto } from './dto/reorder-routine.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('routines')
@UseGuards(JwtAuthGuard)
export class RoutineController {
  constructor(private readonly routineService: RoutineService) {}

  @Post()
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateRoutineDto) {
    const data = await this.routineService.create(userId, dto);
    return { success: true, data };
  }

  @Get()
  async findAll(@CurrentUser('id') userId: string) {
    const data = await this.routineService.findAll(userId);
    return { success: true, data };
  }

  @Patch(':id')
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRoutineDto,
  ) {
    const data = await this.routineService.update(userId, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.routineService.remove(userId, id);
    return { success: true, data: null };
  }

  @Patch('reorder/batch')
  async reorder(@CurrentUser('id') userId: string, @Body() dto: ReorderRoutineDto) {
    await this.routineService.reorder(userId, dto.routineIds);
    return { success: true, data: null };
  }
}
