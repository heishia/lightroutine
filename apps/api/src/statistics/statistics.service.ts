import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getToday(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayName = this.getDayName(today);

    const routines = await this.prisma.routine.findMany({
      where: { userId, deletedAt: null },
    });

    const activeRoutines = routines.filter((r) => r.repeatDays.split(',').includes(dayName));
    const logs = await this.prisma.routineLog.findMany({
      where: { userId, logDate: today },
    });

    const logSet = new Set(logs.map((l) => l.routineId));
    const completedCount = activeRoutines.filter((r) => logSet.has(r.id)).length;
    const totalCount = activeRoutines.length;

    const routinesList = activeRoutines.map((r) => ({
      id: r.id,
      name: r.name,
      color: r.color,
      completed: logSet.has(r.id),
    }));

    return {
      date: this.formatDate(today),
      completedCount,
      totalCount,
      completionRate: totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100),
      routines: routinesList,
    };
  }

  async getWeekly(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    const routines = await this.prisma.routine.findMany({
      where: { userId, deletedAt: null },
    });

    const logs = await this.prisma.routineLog.findMany({
      where: {
        userId,
        logDate: { gte: startOfWeek, lte: endOfWeek },
      },
    });

    const logsByDate = new Map<string, Set<string>>();
    for (const log of logs) {
      const dateKey = this.formatDate(log.logDate);
      if (!logsByDate.has(dateKey)) logsByDate.set(dateKey, new Set());
      logsByDate.get(dateKey)!.add(log.routineId);
    }

    const dailyRates = [];
    let totalRate = 0;

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      const dateKey = this.formatDate(day);
      const dayName = this.getDayName(day);

      const activeRoutines = routines.filter((r) => r.repeatDays.split(',').includes(dayName));
      const completedSet = logsByDate.get(dateKey) || new Set();
      const completedCount = activeRoutines.filter((r) => completedSet.has(r.id)).length;
      const totalCount = activeRoutines.length;
      const rate = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

      dailyRates.push({ date: dateKey, completionRate: rate, completedCount, totalCount });
      totalRate += rate;
    }

    const routineDetails = routines.map((routine) => {
      const repeatDaysList = routine.repeatDays.split(',');
      const completions: (boolean | null)[] = [];
      let completedDays = 0;
      let activeDays = 0;

      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(day.getDate() + i);
        const dateKey = this.formatDate(day);
        const dayName = this.getDayName(day);

        if (!repeatDaysList.includes(dayName)) {
          completions.push(null);
          continue;
        }

        activeDays++;
        const completedSet = logsByDate.get(dateKey) || new Set();
        const done = completedSet.has(routine.id);
        completions.push(done);
        if (done) completedDays++;
      }

      return {
        routineId: routine.id,
        routineName: routine.name,
        color: routine.color,
        completions,
        completionRate: activeDays === 0 ? 0 : Math.round((completedDays / activeDays) * 100),
      };
    });

    return {
      startDate: this.formatDate(startOfWeek),
      endDate: this.formatDate(endOfWeek),
      dailyRates,
      averageRate: Math.round(totalRate / 7),
      routineDetails,
    };
  }

  async getMonthly(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const routines = await this.prisma.routine.findMany({
      where: { userId, deletedAt: null },
    });

    const logs = await this.prisma.routineLog.findMany({
      where: {
        userId,
        logDate: { gte: startDate, lte: endDate },
      },
    });

    const logsByDate = new Map<string, Set<string>>();
    for (const log of logs) {
      const dateKey = this.formatDate(log.logDate);
      if (!logsByDate.has(dateKey)) logsByDate.set(dateKey, new Set());
      logsByDate.get(dateKey)!.add(log.routineId);
    }

    const daysInMonth = endDate.getDate();
    const days = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const day = new Date(year, month - 1, d);
      const dateKey = this.formatDate(day);
      const dayName = this.getDayName(day);

      const activeRoutines = routines.filter((r) => r.repeatDays.split(',').includes(dayName));
      const completedSet = logsByDate.get(dateKey) || new Set();
      const completedCount = activeRoutines.filter((r) => completedSet.has(r.id)).length;
      const totalCount = activeRoutines.length;

      days.push({
        date: dateKey,
        completionRate: totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100),
        completedCount,
        totalCount,
      });
    }

    return { year, month, days };
  }

  async getStreak(userId: string) {
    const routines = await this.prisma.routine.findMany({
      where: { userId, deletedAt: null },
    });

    if (routines.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const logs = await this.prisma.routineLog.findMany({
      where: { userId },
      orderBy: { logDate: 'desc' },
    });

    const logsByDate = new Map<string, Set<string>>();
    for (const log of logs) {
      const dateKey = this.formatDate(log.logDate);
      if (!logsByDate.has(dateKey)) logsByDate.set(dateKey, new Set());
      logsByDate.get(dateKey)!.add(log.routineId);
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let streakBroken = false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const day = new Date(today);
      day.setDate(day.getDate() - i);
      const dateKey = this.formatDate(day);
      const dayName = this.getDayName(day);

      const activeRoutines = routines.filter((r) => r.repeatDays.split(',').includes(dayName));
      if (activeRoutines.length === 0) continue;

      const completedSet = logsByDate.get(dateKey) || new Set();
      const allCompleted = activeRoutines.every((r) => completedSet.has(r.id));

      if (allCompleted) {
        if (!streakBroken) currentStreak++;
        longestStreak = Math.max(longestStreak, streakBroken ? 1 : currentStreak);
      } else {
        if (!streakBroken) streakBroken = true;
      }
    }

    return { currentStreak, longestStreak };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private getDayName(date: Date): string {
    const names = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return names[date.getDay()];
  }
}
