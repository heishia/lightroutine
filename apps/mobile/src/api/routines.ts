import { apiClient } from './client';
import type {
  RoutineResponse,
  CreateRoutineRequest,
  UpdateRoutineRequest,
} from '@lightroutine/types';

export async function fetchRoutines(): Promise<RoutineResponse[]> {
  const res = await apiClient.get<{ data: RoutineResponse[] }>('/routines');
  return res.data.data;
}

export async function createRoutine(data: CreateRoutineRequest): Promise<RoutineResponse> {
  const res = await apiClient.post<{ data: RoutineResponse }>('/routines', data);
  return res.data.data;
}

export async function updateRoutine(
  id: string,
  data: UpdateRoutineRequest,
): Promise<RoutineResponse> {
  const res = await apiClient.patch<{ data: RoutineResponse }>(`/routines/${id}`, data);
  return res.data.data;
}

export async function deleteRoutine(id: string): Promise<void> {
  await apiClient.delete(`/routines/${id}`);
}

export async function reorderRoutines(routineIds: string[]): Promise<void> {
  await apiClient.patch('/routines/reorder/batch', { routineIds });
}
