import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/colors';
import { useTodayStats, useWeeklyStats, useStreak } from '../../src/hooks/use-statistics';
import { CircularProgress } from '../../src/components/CircularProgress';
import type { RoutineWeeklyDetail } from '@lightroutine/types';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

function getCompletionColor(rate: number) {
  if (rate >= 80) return Colors.success;
  if (rate >= 50) return Colors.warning;
  if (rate > 0) return Colors.primary;
  return Colors.disabled;
}

function AnimatedBar({ rate, index }: { rate: number; index: number }) {
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: Math.max(rate, 3),
      duration: 600,
      delay: index * 80,
      useNativeDriver: false,
    }).start();
  }, [rate]);

  const height = heightAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          height,
          backgroundColor: getCompletionColor(rate),
        },
      ]}
    />
  );
}

function CompletionDot({ status }: { status: boolean | null }) {
  if (status === null) {
    return <View style={[styles.dot, styles.dotInactive]} />;
  }
  return (
    <View
      style={[
        styles.dot,
        status ? styles.dotCompleted : styles.dotMissed,
      ]}
    >
      {status && <Text style={styles.dotCheck}>✓</Text>}
    </View>
  );
}

function RoutineTrackingRow({ detail }: { detail: RoutineWeeklyDetail }) {
  return (
    <View style={styles.routineRow}>
      <View style={styles.routineInfo}>
        <View style={[styles.routineColorDot, { backgroundColor: detail.color }]} />
        <Text style={styles.routineName} numberOfLines={1}>
          {detail.routineName}
        </Text>
      </View>
      <View style={styles.routineDots}>
        {detail.completions.map((status, idx) => (
          <CompletionDot key={idx} status={status} />
        ))}
      </View>
      <Text style={styles.routineRate}>{detail.completionRate}%</Text>
    </View>
  );
}

function AnimatedProgressBar({ rate, color }: { rate: number; color: string }) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: rate,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [rate]);

  const width = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.progressBar}>
      <Animated.View
        style={[styles.progressFill, { width, backgroundColor: color }]}
      />
    </View>
  );
}

export default function StatisticsScreen() {
  const { data: todayStats, isLoading: todayLoading } = useTodayStats();
  const { data: weeklyStats, isLoading: weeklyLoading } = useWeeklyStats();
  const { data: streak, isLoading: streakLoading } = useStreak();

  const isLoading = todayLoading || weeklyLoading || streakLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  const todayRate = todayStats?.completionRate ?? 0;
  const todayCompleted = todayStats?.completedCount ?? 0;
  const todayTotal = todayStats?.totalCount ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>통계</Text>

        {/* Today + Streak */}
        <View style={styles.topRow}>
          <View style={styles.todayCard}>
            <CircularProgress
              percentage={todayRate}
              size={110}
              strokeWidth={10}
              color={getCompletionColor(todayRate)}
              label="오늘"
              subLabel={`${todayCompleted}/${todayTotal}`}
            />
          </View>

          <View style={styles.streakColumn}>
            <View style={styles.streakCard}>
              <Text style={styles.streakIcon}>🔥</Text>
              <Text style={styles.streakNumber}>{streak?.currentStreak ?? 0}일</Text>
              <Text style={styles.streakLabel}>연속 달성</Text>
            </View>
            <View style={styles.streakCard}>
              <Text style={styles.streakIcon}>🏆</Text>
              <Text style={styles.streakNumber}>{streak?.longestStreak ?? 0}일</Text>
              <Text style={styles.streakLabel}>최고 기록</Text>
            </View>
          </View>
        </View>

        {/* Today's Routine Status */}
        {todayStats?.routines && todayStats.routines.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>오늘의 루틴</Text>
            {todayStats.routines.map((routine) => (
              <View key={routine.id} style={styles.todayRoutineRow}>
                <View style={styles.todayRoutineLeft}>
                  <View
                    style={[
                      styles.todayRoutineIndicator,
                      {
                        backgroundColor: routine.completed
                          ? routine.color
                          : Colors.disabled,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.todayRoutineName,
                      routine.completed && styles.todayRoutineCompleted,
                    ]}
                  >
                    {routine.name}
                  </Text>
                </View>
                <View
                  style={[
                    styles.todayRoutineStatus,
                    {
                      backgroundColor: routine.completed
                        ? Colors.success + '18'
                        : Colors.error + '18',
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: FontSize.xs,
                      fontWeight: '600',
                      color: routine.completed ? Colors.success : Colors.error,
                    }}
                  >
                    {routine.completed ? '완료' : '미완료'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Weekly Bar Chart */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>이번 주 달성도</Text>
            <View style={styles.averageBadge}>
              <Text style={styles.averageText}>
                평균 {weeklyStats?.averageRate ?? 0}%
              </Text>
            </View>
          </View>

          <View style={styles.barChart}>
            {weeklyStats?.dailyRates.map((day, idx) => {
              const isToday = day.date === todayStats?.date;
              return (
                <View key={day.date} style={styles.barItem}>
                  <Text style={styles.barTopValue}>{day.completionRate}%</Text>
                  <View
                    style={[
                      styles.barContainer,
                      isToday && styles.barContainerToday,
                    ]}
                  >
                    <AnimatedBar rate={day.completionRate} index={idx} />
                  </View>
                  <Text
                    style={[
                      styles.barLabel,
                      isToday && styles.barLabelToday,
                    ]}
                  >
                    {DAY_LABELS[idx]}
                  </Text>
                  <Text style={styles.barSub}>
                    {day.completedCount}/{day.totalCount}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Per-Routine Weekly Tracking Grid */}
        {weeklyStats?.routineDetails && weeklyStats.routineDetails.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>루틴별 주간 트래킹</Text>
            <View style={styles.trackingHeader}>
              <View style={styles.routineInfo} />
              <View style={styles.routineDots}>
                {DAY_LABELS.map((label) => (
                  <Text key={label} style={styles.trackingDayLabel}>
                    {label}
                  </Text>
                ))}
              </View>
              <Text style={styles.routineRateHeader}>달성</Text>
            </View>
            {weeklyStats.routineDetails.map((detail) => (
              <RoutineTrackingRow key={detail.routineId} detail={detail} />
            ))}
          </View>
        )}

        {/* Weekly Detail */}
        <View style={[styles.card, { marginBottom: 0 }]}>
          <Text style={styles.cardTitle}>주간 상세</Text>
          {weeklyStats?.dailyRates.map((day, idx) => {
            const color = getCompletionColor(day.completionRate);
            const isToday = day.date === todayStats?.date;
            return (
              <View
                key={day.date}
                style={[
                  styles.detailRow,
                  isToday && styles.detailRowToday,
                ]}
              >
                <Text
                  style={[
                    styles.detailDay,
                    isToday && styles.detailDayToday,
                  ]}
                >
                  {DAY_LABELS[idx]}
                </Text>
                <AnimatedProgressBar rate={day.completionRate} color={color} />
                <Text style={styles.detailRate}>{day.completionRate}%</Text>
                <Text style={styles.detailValue}>
                  {day.completedCount}/{day.totalCount}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },

  topRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  todayCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  streakColumn: {
    gap: Spacing.sm,
    width: 130,
  },
  streakCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  streakIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  streakNumber: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  streakLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  averageBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  averageText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
  },

  todayRoutineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  todayRoutineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  todayRoutineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  todayRoutineName: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  todayRoutineCompleted: {
    color: Colors.text,
    fontWeight: '500',
  },
  todayRoutineStatus: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },

  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 180,
    paddingTop: Spacing.md,
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
  },
  barTopValue: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  barContainer: {
    flex: 1,
    width: 24,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barContainerToday: {
    borderWidth: 1.5,
    borderColor: Colors.primary + '40',
  },
  bar: {
    width: '100%',
    borderRadius: BorderRadius.sm,
  },
  barLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 6,
    fontWeight: '500',
  },
  barLabelToday: {
    color: Colors.primary,
    fontWeight: '700',
  },
  barSub: {
    fontSize: 9,
    color: Colors.textTertiary,
    marginTop: 1,
  },

  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  trackingDayLabel: {
    width: 24,
    textAlign: 'center',
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  routineInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  routineColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  routineName: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.text,
  },
  routineDots: {
    flexDirection: 'row',
    gap: 2,
  },
  routineRate: {
    width: 36,
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  routineRateHeader: {
    width: 36,
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textTertiary,
    textAlign: 'right',
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCompleted: {
    backgroundColor: Colors.success + '20',
  },
  dotMissed: {
    backgroundColor: Colors.error + '12',
  },
  dotInactive: {
    backgroundColor: Colors.background,
  },
  dotCheck: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '700',
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: BorderRadius.sm,
  },
  detailRowToday: {
    backgroundColor: Colors.primary + '08',
  },
  detailDay: {
    width: 28,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  detailDayToday: {
    color: Colors.primary,
    fontWeight: '700',
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginHorizontal: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  detailRate: {
    width: 36,
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'right',
  },
  detailValue: {
    width: 36,
    fontSize: 10,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginLeft: 4,
  },
});
