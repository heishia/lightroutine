import { TimeSlot, Weekday, RoutineCategory } from './common';

export interface RoutineResponse {
  id: string;
  name: string;
  category: RoutineCategory;
  timeSlot: TimeSlot;
  color: string;
  repeatDays: Weekday[];
  sortOrder: number;
  createdAt: string;
}

export interface CreateRoutineRequest {
  name: string;
  category: RoutineCategory;
  timeSlot: TimeSlot;
  color: string;
  repeatDays: Weekday[];
}

export interface UpdateRoutineRequest {
  name?: string;
  category?: RoutineCategory;
  timeSlot?: TimeSlot;
  color?: string;
  repeatDays?: Weekday[];
}

export interface ReorderRoutineRequest {
  routineIds: string[];
}
