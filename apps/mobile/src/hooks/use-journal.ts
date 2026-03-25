import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchJournalByDate,
  fetchMonthlyJournals,
  upsertJournal,
  deleteJournal,
} from '../api/journal';

export function useJournalByDate(date: string) {
  return useQuery({
    queryKey: ['journal', date],
    queryFn: () => fetchJournalByDate(date),
  });
}

export function useMonthlyJournals(year: number, month: number) {
  return useQuery({
    queryKey: ['journal', 'monthly', year, month],
    queryFn: () => fetchMonthlyJournals(year, month),
  });
}

export function useUpsertJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertJournal,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['journal', variables.entryDate] });
      queryClient.invalidateQueries({ queryKey: ['journal', 'monthly'] });
    },
  });
}

export function useDeleteJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteJournal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] });
    },
  });
}
