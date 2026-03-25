import { apiClient } from './client';
import type { DailyTrackingResponse } from '@lightroutine/types';

export async function toggleRoutine(routineId: string, date?: string) {
  const res = await apiClient.post(`/tracking/${routineId}/toggle`, date ? { date } : {});
  return res.data.data;
}

export async function fetchDailyTracking(date: string): Promise<DailyTrackingResponse> {
  const res = await apiClient.get<{ data: DailyTrackingResponse }>('/tracking', {
    params: { date },
  });
  return res.data.data;
}
