export interface JournalResponse {
  id: string;
  entryDate: string;
  mood: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalListItem {
  entryDate: string;
  mood: string;
  title: string;
}

export interface MonthlyJournalResponse {
  year: number;
  month: number;
  entries: JournalListItem[];
}
