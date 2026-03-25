import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';

@Injectable()
export class RoutineService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateRoutineDto) {
    const maxOrder = await this.prisma.routine.aggregate({
      where: { userId, deletedAt: null },
      _max: { sortOrder: true },
    });

    const routine = await this.prisma.routine.create({
      data: {
        userId,
        name: dto.name,
        category: dto.category,
        timeSlot: dto.timeSlot,
        color: dto.color,
        repeatDays: dto.repeatDays.join(','),
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    });

    return this.toResponse(routine);
  }

  async findAll(userId: string) {
    const routines = await this.prisma.routine.findMany({
      where: { userId, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });

    return routines.map((r) => this.toResponse(r));
  }

  async update(userId: string, id: string, dto: UpdateRoutineDto) {
    const routine = await this.findOwned(userId, id);

    const updated = await this.prisma.routine.update({
      where: { id: routine.id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.timeSlot !== undefined && { timeSlot: dto.timeSlot }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.repeatDays !== undefined && { repeatDays: dto.repeatDays.join(',') }),
      },
    });

    return this.toResponse(updated);
  }

  async remove(userId: string, id: string) {
    const routine = await this.findOwned(userId, id);

    await this.prisma.routine.update({
      where: { id: routine.id },
      data: { deletedAt: new Date() },
    });
  }

  async reorder(userId: string, routineIds: string[]) {
    const updates = routineIds.map((id, index) =>
      this.prisma.routine.updateMany({
        where: { id, userId, deletedAt: null },
        data: { sortOrder: index },
      }),
    );

    await this.prisma.$transaction(updates);
  }

  private async findOwned(userId: string, id: string) {
    const routine = await this.prisma.routine.findUnique({ where: { id } });

    if (!routine || routine.deletedAt) {
      throw new NotFoundException('Routine not found');
    }

    if (routine.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    return routine;
  }

  private toResponse(routine: {
    id: string;
    name: string;
    category: string;
    timeSlot: string;
    color: string;
    repeatDays: string;
    sortOrder: number;
    createdAt: Date;
  }) {
    return {
      id: routine.id,
      name: routine.name,
      category: routine.category,
      timeSlot: routine.timeSlot,
      color: routine.color,
      repeatDays: routine.repeatDays.split(','),
      sortOrder: routine.sortOrder,
      createdAt: routine.createdAt.toISOString(),
    };
  }
}
