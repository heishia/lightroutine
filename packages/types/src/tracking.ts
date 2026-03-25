export interface RoutineLogResponse {
  id: string;
  routineId: string;
  logDate: string;
  completed: boolean;
}

export interface DailyTrackingResponse {
  date: string;
  logs: RoutineLogResponse[];
  completedCount: number;
  totalCount: number;
}
