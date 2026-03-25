import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/colors';
import { useTodayStats, useWeeklyStats, useStreak } from '../../src/hooks/use-statistics';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Statistics</Text>

        <View style={styles.row}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{todayStats?.completionRate ?? 0}%</Text>
            <Text style={styles.statLabel}>Today</Text>
            <Text style={styles.statSub}>
              {todayStats?.completedCount ?? 0}/{todayStats?.totalCount ?? 0}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{streak?.currentStreak ?? 0}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
            <Text style={styles.statSub}>Best: {streak?.longestStreak ?? 0}</Text>
          </View>
        </View>

        <View style={styles.weeklyCard}>
          <Text style={styles.cardTitle}>This Week</Text>
          <Text style={styles.weeklyAverage}>
            Average: {weeklyStats?.averageRate ?? 0}%
          </Text>

          <View style={styles.barChart}>
            {weeklyStats?.dailyRates.map((day, idx) => (
              <View key={day.date} style={styles.barItem}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${Math.max(day.completionRate, 4)}%`,
                        backgroundColor:
                          day.completionRate >= 80
                            ? Colors.success
                            : day.completionRate >= 50
                              ? Colors.warning
                              : Colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{DAY_LABELS[idx]}</Text>
                <Text style={styles.barValue}>{day.completionRate}%</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>Weekly Breakdown</Text>
          {weeklyStats?.dailyRates.map((day, idx) => (
            <View key={day.date} style={styles.detailRow}>
              <Text style={styles.detailDay}>{DAY_LABELS[idx]}</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${day.completionRate}%` },
                  ]}
                />
              </View>
              <Text style={styles.detailValue}>
                {day.completedCount}/{day.totalCount}
              </Text>
            </View>
          ))}
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
    paddingBottom: 100,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: FontSize.title,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statSub: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  weeklyCard: {
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
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  weeklyAverage: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 140,
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    width: 20,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: BorderRadius.sm,
  },
  barLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  barValue: {
    fontSize: 9,
    color: Colors.textTertiary,
  },
  detailCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  detailDay: {
    width: 36,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginHorizontal: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  detailValue: {
    width: 36,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'right',
  },
});
