import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrackingService {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(userId: string, routineId: string, dateStr?: string) {
    const today = dateStr ? new Date(dateStr) : new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.routineLog.findUnique({
      where: {
        routineId_logDate: { routineId, logDate: today },
      },
    });

    if (existing) {
      await this.prisma.routineLog.delete({
        where: { id: existing.id },
      });
      return { routineId, logDate: this.formatDate(today), completed: false };
    }

    const log = await this.prisma.routineLog.create({
      data: { routineId, userId, logDate: today, completed: true },
    });

    return {
      id: log.id,
      routineId: log.routineId,
      logDate: this.formatDate(log.logDate),
      completed: log.completed,
    };
  }

  async getByDate(userId: string, dateStr: string) {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    const routines = await this.prisma.routine.findMany({
      where: { userId, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });

    const logs = await this.prisma.routineLog.findMany({
      where: { userId, logDate: date },
    });

    const logMap = new Map(logs.map((l) => [l.routineId, l]));

    const dayName = this.getDayName(date);
    const activeRoutines = routines.filter((r) => r.repeatDays.split(',').includes(dayName));

    return {
      date: this.formatDate(date),
      logs: activeRoutines.map((r) => {
        const log = logMap.get(r.id);
        return {
          id: log?.id ?? null,
          routineId: r.id,
          logDate: this.formatDate(date),
          completed: !!log,
        };
      }),
      completedCount: activeRoutines.filter((r) => logMap.has(r.id)).length,
      totalCount: activeRoutines.length,
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private getDayName(date: Date): string {
    const names = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return names[date.getDay()];
  }
}
