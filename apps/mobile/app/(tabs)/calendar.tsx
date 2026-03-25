import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/colors';
import { useMonthlyStats } from '../../src/hooks/use-statistics';
import { useDailyTracking } from '../../src/hooks/use-tracking';
import { useRoutines } from '../../src/hooks/use-routines';
import type { RoutineResponse } from '@lightroutine/types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1);
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [];

  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

function getRateColor(rate: number): string {
  if (rate === 0) return Colors.background;
  if (rate < 30) return '#E8F5E9';
  if (rate < 60) return '#A5D6A7';
  if (rate < 90) return '#66BB6A';
  return '#2E7D32';
}

export default function CalendarScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: monthlyData, isLoading } = useMonthlyStats(year, month);
  const { data: dayTracking } = useDailyTracking(selectedDate || '');
  const { data: routines } = useRoutines();

  const rateMap = useMemo(() => {
    const map = new Map<number, number>();
    if (monthlyData?.days) {
      monthlyData.days.forEach((d) => {
        const day = parseInt(d.date.split('-')[2]);
        map.set(day, d.completionRate);
      });
    }
    return map;
  }, [monthlyData]);

  const cells = useMemo(() => getCalendarDays(year, month), [year, month]);

  const prevMonth = () => {
    if (month === 1) { setYear(year - 1); setMonth(12); }
    else setMonth(month - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (month === 12) { setYear(year + 1); setMonth(1); }
    else setMonth(month + 1);
    setSelectedDate(null);
  };

  const handleDayPress = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr === selectedDate ? null : dateStr);
  };

  const routineMap = useMemo(() => {
    const map = new Map<string, RoutineResponse>();
    routines?.forEach((r: RoutineResponse) => map.set(r.id, r));
    return map;
  }, [routines]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
          <Text style={styles.navText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{MONTH_NAMES[month - 1]} {year}</Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
          <Text style={styles.navText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.dayHeaders}>
            {DAY_HEADERS.map((d, i) => (
              <Text key={i} style={styles.dayHeader}>{d}</Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((day, idx) => {
              const rate = day ? (rateMap.get(day) ?? 0) : 0;
              const isSelected =
                day &&
                selectedDate ===
                  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.cell,
                    day ? { backgroundColor: getRateColor(rate) } : undefined,
                    isSelected ? styles.cellSelected : undefined,
                  ]}
                  onPress={() => day && handleDayPress(day)}
                  disabled={!day}
                >
                  <Text
                    style={[
                      styles.cellText,
                      !day && styles.cellTextEmpty,
                      rate >= 60 && { color: '#FFFFFF' },
                    ]}
                  >
                    {day ?? ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedDate && dayTracking && (
            <View style={styles.detail}>
              <Text style={styles.detailTitle}>
                {dayTracking.completedCount}/{dayTracking.totalCount} completed
              </Text>
              <FlatList
                data={dayTracking.logs}
                keyExtractor={(item) => item.routineId}
                renderItem={({ item }) => {
                  const routine = routineMap.get(item.routineId);
                  return (
                    <View style={styles.logItem}>
                      <View
                        style={[
                          styles.logDot,
                          { backgroundColor: item.completed ? Colors.success : Colors.disabled },
                        ]}
                      />
                      <Text style={styles.logText}>
                        {routine?.name || 'Unknown routine'}
                      </Text>
                    </View>
                  );
                }}
              />
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  navBtn: {
    padding: Spacing.sm,
  },
  navText: {
    fontSize: FontSize.xl,
    color: Colors.primary,
    fontWeight: '600',
  },
  monthTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  dayHeaders: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
  },
  cell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
    marginBottom: 2,
  },
  cellSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  cellText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.text,
  },
  cellTextEmpty: {
    color: 'transparent',
  },
  detail: {
    flex: 1,
    padding: Spacing.lg,
  },
  detailTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  logDot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  logText: {
    fontSize: FontSize.sm,
    color: Colors.text,
  },
});
