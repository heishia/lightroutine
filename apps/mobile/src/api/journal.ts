import { apiClient } from './client';
import type {
  JournalResponse,
  MonthlyJournalResponse,
} from '@lightroutine/types';

export async function upsertJournal(data: {
  entryDate: string;
  mood: string;
  title: string;
  content: string;
}): Promise<JournalResponse> {
  const res = await apiClient.put<{ data: JournalResponse }>('/journal', data);
  return res.data.data;
}

export async function fetchJournalByDate(
  date: string,
): Promise<JournalResponse | null> {
  const res = await apiClient.get<{ data: JournalResponse | null }>('/journal', {
    params: { date },
  });
  return res.data.data;
}

export async function fetchMonthlyJournals(
  year: number,
  month: number,
): Promise<MonthlyJournalResponse> {
  const res = await apiClient.get<{ data: MonthlyJournalResponse }>(
    '/journal/monthly',
    { params: { year, month } },
  );
  return res.data.data;
}

export async function deleteJournal(id: string): Promise<void> {
  await apiClient.delete(`/journal/${id}`);
}
