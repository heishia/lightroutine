import { useState, useMemo } from 'react';
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
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/colors';
import { useRoutines, useCreateRoutine } from '../../src/hooks/use-routines';
import { useDailyTracking, useToggleRoutine } from '../../src/hooks/use-tracking';
import { useTodayStats } from '../../src/hooks/use-statistics';
import { RoutineItem } from '../../src/components/RoutineItem';
import { CreateRoutineModal } from '../../src/components/CreateRoutineModal';
import type { RoutineResponse, Weekday, TimeSlot, RoutineCategory } from '@lightroutine/types';

const TODAY = new Date().toISOString().split('T')[0];
const DAY_NAMES: Weekday[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const TODAY_DAY = DAY_NAMES[new Date().getDay()];

export default function HomeScreen() {
  const [showModal, setShowModal] = useState(false);
  const { data: routines, isLoading: routinesLoading, refetch } = useRoutines();
  const { data: tracking } = useDailyTracking(TODAY);
  const { data: todayStats } = useTodayStats();
  const createMutation = useCreateRoutine();
  const toggleMutation = useToggleRoutine();

  const activeRoutines = useMemo(() => {
    if (!routines) return [];
    return routines.filter((r: RoutineResponse) => r.repeatDays.includes(TODAY_DAY));
  }, [routines]);

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

  const TIME_LABELS: Record<string, string> = {
    MORNING: 'Morning',
    AFTERNOON: 'Afternoon',
    EVENING: 'Evening',
  };

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
        <View>
          <Text style={styles.greeting}>Today</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        {todayStats && (
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>{todayStats.completionRate}%</Text>
            <Text style={styles.statsLabel}>done</Text>
          </View>
        )}
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
            <Text style={styles.emptyText}>No routines for today</Text>
            <Text style={styles.emptySubtext}>Tap + to create your first routine</Text>
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
    bottom: 100,
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
