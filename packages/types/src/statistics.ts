export interface TodayStatisticsResponse {
  date: string;
  completedCount: number;
  totalCount: number;
  completionRate: number;
  routines: {
    id: string;
    name: string;
    color: string;
    completed: boolean;
  }[];
}

export interface RoutineWeeklyDetail {
  routineId: string;
  routineName: string;
  color: string;
  completions: (boolean | null)[];
  completionRate: number;
}

export interface WeeklyStatisticsResponse {
  startDate: string;
  endDate: string;
  dailyRates: {
    date: string;
    completionRate: number;
    completedCount: number;
    totalCount: number;
  }[];
  averageRate: number;
  routineDetails: RoutineWeeklyDetail[];
}

export interface MonthlyCalendarDay {
  date: string;
  completionRate: number;
  completedCount: number;
  totalCount: number;
}

export interface MonthlyStatisticsResponse {
  year: number;
  month: number;
  days: MonthlyCalendarDay[];
}

export interface StreakResponse {
  currentStreak: number;
  longestStreak: number;
}
