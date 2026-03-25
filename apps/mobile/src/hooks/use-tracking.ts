import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDailyTracking, toggleRoutine } from '../api/tracking';

export function useDailyTracking(date: string) {
  return useQuery({
    queryKey: ['tracking', date],
    queryFn: () => fetchDailyTracking(date),
  });
}

export function useToggleRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (routineId: string) => toggleRoutine(routineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
}
