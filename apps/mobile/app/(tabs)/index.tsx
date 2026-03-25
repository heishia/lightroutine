import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/colors';
import { useRoutines, useCreateRoutine } from '../../src/hooks/use-routines';
import { useDailyTracking, useToggleRoutine } from '../../src/hooks/use-tracking';
import { RoutineItem } from '../../src/components/RoutineItem';
import { CreateRoutineModal } from '../../src/components/CreateRoutineModal';
import { DatePickerModal } from '../../src/components/DatePickerModal';
import type { RoutineResponse, Weekday, TimeSlot, RoutineCategory } from '@lightroutine/types';

const DAY_NAMES: Weekday[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getTodayString(): string {
  return getDateString(new Date());
}

function getWeekdayFromDateStr(dateStr: string): Weekday {
  const d = new Date(dateStr);
  return DAY_NAMES[d.getDay()];
}

function formatKoreanDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(getTodayString);
  const [showModal, setShowModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isToday = selectedDate === getTodayString();
  const selectedWeekday = getWeekdayFromDateStr(selectedDate);

  const { data: routines, isLoading: routinesLoading, refetch } = useRoutines();
  const { data: tracking } = useDailyTracking(selectedDate);
  const createMutation = useCreateRoutine();
  const toggleMutation = useToggleRoutine(selectedDate);

  const activeRoutines = useMemo(() => {
    if (!routines) return [];
    return routines.filter((r: RoutineResponse) => r.repeatDays.includes(selectedWeekday));
  }, [routines, selectedWeekday]);

  const grouped = useMemo(() => {
    const groups: Record<string, RoutineResponse[]> = {
      MORNING: [],
      AFTERNOON: [],
      EVENING: [],
    };
    activeRoutines.forEach((r: RoutineResponse) => {
      if (groups[r.timeSlot]) groups[r.timeSlot].push(r);
    });
    return Object.entries(groups).filter(([, items]) => items.length > 0);
  }, [activeRoutines]);

  const completedSet = useMemo(() => {
    if (!tracking?.logs) return new Set<string>();
    return new Set(tracking.logs.filter((l) => l.completed).map((l) => l.routineId));
  }, [tracking]);

  const completionRate = useMemo(() => {
    if (!tracking) return 0;
    const { completedCount, totalCount } = tracking;
    return totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  }, [tracking]);

  const handleCreate = async (data: {
    name: string;
    category: RoutineCategory;
    timeSlot: TimeSlot;
    color: string;
    repeatDays: Weekday[];
  }) => {
    await createMutation.mutateAsync(data);
    setShowModal(false);
  };

  const handleDateSelect = useCallback((dateStr: string) => {
    setSelectedDate(dateStr);
    setShowDatePicker(false);
  }, []);

  const TIME_LABELS: Record<string, string> = {
    MORNING: '아침',
    AFTERNOON: '오후',
    EVENING: '저녁',
  };

  const headerTitle = isToday ? '오늘' : formatKoreanDate(selectedDate).split(' ').pop() || '';

  if (routinesLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
          <View style={styles.dateRow}>
            <Text style={styles.greeting}>{isToday ? '오늘' : formatKoreanDate(selectedDate).split(' ')[0]}</Text>
            <Feather name="chevron-down" size={20} color={Colors.textSecondary} style={{ marginLeft: 4, marginTop: 2 }} />
          </View>
          <Text style={styles.date}>
            {formatKoreanDate(selectedDate)}
          </Text>
          {!isToday && (
            <TouchableOpacity
              style={styles.todayChip}
              onPress={() => setSelectedDate(getTodayString())}
            >
              <Text style={styles.todayChipText}>오늘로 이동</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>{completionRate}%</Text>
          <Text style={styles.statsLabel}>완료</Text>
        </View>
      </View>

      <FlatList
        data={grouped}
        keyExtractor={([slot]) => slot}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
        renderItem={({ item: [slot, items] }) => (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{TIME_LABELS[slot] || slot}</Text>
            {items.map((routine: RoutineResponse) => (
              <RoutineItem
                key={routine.id}
                routine={routine}
                completed={completedSet.has(routine.id)}
                onToggle={() => toggleMutation.mutate(routine.id)}
                onPress={() => {}}
              />
            ))}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {isToday ? '오늘 루틴이 없습니다' : '이 날짜에 루틴이 없습니다'}
            </Text>
            <Text style={styles.emptySubtext}>
              {isToday
                ? '+ 버튼을 눌러 첫 루틴을 만들어 보세요'
                : '해당 요일에 반복되는 루틴이 없습니다'}
            </Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <CreateRoutineModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreate}
      />

      <DatePickerModal
        visible={showDatePicker}
        selectedDate={selectedDate}
        onClose={() => setShowDatePicker(false)}
        onSelect={handleDateSelect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  date: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  todayChip: {
    marginTop: 6,
    backgroundColor: Colors.primaryLight + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  todayChipText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
  },
  statsCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  statsNumber: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
  },
  emptyText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    fontSize: 28,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 30,
  },
});
