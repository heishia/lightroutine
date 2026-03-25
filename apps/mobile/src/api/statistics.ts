import { apiClient } from './client';
import type {
  TodayStatisticsResponse,
  WeeklyStatisticsResponse,
  MonthlyStatisticsResponse,
  StreakResponse,
} from '@lightroutine/types';

export async function fetchTodayStats(): Promise<TodayStatisticsResponse> {
  const res = await apiClient.get<{ data: TodayStatisticsResponse }>('/statistics/today');
  return res.data.data;
}

export async function fetchWeeklyStats(): Promise<WeeklyStatisticsResponse> {
  const res = await apiClient.get<{ data: WeeklyStatisticsResponse }>('/statistics/weekly');
  return res.data.data;
}

export async function fetchMonthlyStats(
  year: number,
  month: number,
): Promise<MonthlyStatisticsResponse> {
  const res = await apiClient.get<{ data: MonthlyStatisticsResponse }>('/statistics/monthly', {
    params: { year, month },
  });
  return res.data.data;
}

export async function fetchStreak(): Promise<StreakResponse> {
  const res = await apiClient.get<{ data: StreakResponse }>('/statistics/streak');
  return res.data.data;
}
