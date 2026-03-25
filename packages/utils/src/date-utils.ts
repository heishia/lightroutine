import { Weekday } from '@lightroutine/types';

const WEEKDAY_INDEX: Record<Weekday, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getTodayWeekday(): Weekday {
  const dayNames: Weekday[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return dayNames[new Date().getDay()];
}

export function isRoutineActiveOnDay(repeatDays: Weekday[], day: Weekday): boolean {
  return repeatDays.includes(day);
}

export function getWeekdayIndex(day: Weekday): number {
  return WEEKDAY_INDEX[day];
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfWeek(date: Date): Date {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}
