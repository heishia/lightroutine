import { useQuery } from '@tanstack/react-query';
import {
  fetchTodayStats,
  fetchWeeklyStats,
  fetchMonthlyStats,
  fetchStreak,
} from '../api/statistics';

export function useTodayStats() {
  return useQuery({
    queryKey: ['statistics', 'today'],
    queryFn: fetchTodayStats,
  });
}

export function useWeeklyStats() {
  return useQuery({
    queryKey: ['statistics', 'weekly'],
    queryFn: fetchWeeklyStats,
  });
}

export function useMonthlyStats(year: number, month: number) {
  return useQuery({
    queryKey: ['statistics', 'monthly', year, month],
    queryFn: () => fetchMonthlyStats(year, month),
  });
}

export function useStreak() {
  return useQuery({
    queryKey: ['statistics', 'streak'],
    queryFn: fetchStreak,
  });
}
