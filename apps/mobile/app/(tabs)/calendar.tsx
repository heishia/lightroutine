import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/colors';
import {
  useJournalByDate,
  useMonthlyJournals,
  useUpsertJournal,
  useDeleteJournal,
} from '../../src/hooks/use-journal';
import { JournalEditorModal } from '../../src/components/JournalEditorModal';

const SCREEN_WIDTH = Dimensions.get('window').width;
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function formatDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatJournalDate(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return `${year}년 ${month}월 ${day}일 ${weekdays[d.getDay()]}`;
}

export default function CalendarScreen() {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [editorVisible, setEditorVisible] = useState(false);

  const todayStr = getTodayString();
  const isToday = selectedDate === todayStr;

  const { data: monthlyData, isLoading: monthlyLoading } = useMonthlyJournals(viewYear, viewMonth + 1);
  const { data: journal, isLoading: journalLoading } = useJournalByDate(selectedDate);
  const upsertMutation = useUpsertJournal();
  const deleteMutation = useDeleteJournal();

  const entryMap = useMemo(() => {
    const map = new Map<string, { mood: string; title: string }>();
    if (monthlyData?.entries) {
      monthlyData.entries.forEach((e) => {
        map.set(e.entryDate, { mood: e.mood, title: e.title });
      });
    }
    return map;
  }, [monthlyData]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = viewMonth - 1;
      const y = m < 0 ? viewYear - 1 : viewYear;
      const actualMonth = m < 0 ? 11 : m;
      days.push({ day: d, dateStr: formatDateString(y, actualMonth, d), isCurrentMonth: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, dateStr: formatDateString(viewYear, viewMonth, d), isCurrentMonth: true });
    }

    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const m = viewMonth + 1;
        const y = m > 11 ? viewYear + 1 : viewYear;
        const actualMonth = m > 11 ? 0 : m;
        days.push({ day: d, dateStr: formatDateString(y, actualMonth, d), isCurrentMonth: false });
      }
    }

    return days;
  }, [viewYear, viewMonth]);

  const goToPrevMonth = useCallback(() => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }, [viewMonth]);

  const goToNextMonth = useCallback(() => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }, [viewMonth]);

  const handleSave = useCallback(
    async (data: { mood: string; title: string; content: string }) => {
      await upsertMutation.mutateAsync({
        entryDate: selectedDate,
        ...data,
      });
      setEditorVisible(false);
    },
    [selectedDate, upsertMutation],
  );

  const handleDelete = useCallback(() => {
    if (!journal?.id) return;
    Alert.alert('일기 삭제', '이 일기를 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await deleteMutation.mutateAsync(journal.id);
        },
      },
    ]);
  }, [journal, deleteMutation]);

  const monthLabel = `${viewYear}년 ${viewMonth + 1}월`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>기록</Text>
          {!isToday && (
            <TouchableOpacity
              style={styles.todayBtn}
              onPress={() => {
                const n = new Date();
                setViewYear(n.getFullYear());
                setViewMonth(n.getMonth());
                setSelectedDate(getTodayString());
              }}
            >
              <Text style={styles.todayBtnText}>오늘</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Mini Calendar */}
        <View style={styles.calendarCard}>
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={goToPrevMonth} style={styles.navBtn}>
              <Feather name="chevron-left" size={20} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <TouchableOpacity onPress={goToNextMonth} style={styles.navBtn}>
              <Feather name="chevron-right" size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((label, i) => (
              <View key={i} style={styles.weekdayCell}>
                <Text
                  style={[
                    styles.weekdayText,
                    i === 0 && { color: Colors.error },
                    i === 6 && { color: Colors.primary },
                  ]}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>

          {monthlyLoading ? (
            <View style={styles.calendarLoading}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : (
            <View style={styles.daysGrid}>
              {calendarDays.map(({ day, dateStr, isCurrentMonth }, index) => {
                const isSelected = dateStr === selectedDate;
                const isDayToday = dateStr === todayStr;
                const dayOfWeek = index % 7;
                const entry = entryMap.get(dateStr);

                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.dayCell}
                    onPress={() => setSelectedDate(dateStr)}
                    activeOpacity={0.6}
                  >
                    <View
                      style={[
                        styles.dayInner,
                        isSelected && styles.dayInnerSelected,
                        isDayToday && !isSelected && styles.dayInnerToday,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          !isCurrentMonth && styles.dayTextMuted,
                          dayOfWeek === 0 && isCurrentMonth && { color: Colors.error },
                          dayOfWeek === 6 && isCurrentMonth && { color: Colors.primary },
                          isSelected && { color: '#FFFFFF' },
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                    {entry && isCurrentMonth ? (
                      <Text style={styles.dayMood}>{entry.mood}</Text>
                    ) : (
                      <View style={styles.dayMoodPlaceholder} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Journal Entry View */}
        <View style={styles.journalSection}>
          <View style={styles.journalDateRow}>
            <View style={styles.journalDateLine} />
            <Text style={styles.journalDate}>{formatJournalDate(selectedDate)}</Text>
            <View style={styles.journalDateLine} />
          </View>

          {journalLoading ? (
            <View style={styles.loadingArea}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : journal ? (
            <View style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryMood}>{journal.mood}</Text>
                <View style={styles.entryActions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => setEditorVisible(true)}
                  >
                    <Feather name="edit-2" size={16} color={Colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
                    <Feather name="trash-2" size={16} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.entryTitle}>{journal.title}</Text>
              {journal.content.length > 0 && (
                <Text style={styles.entryContent}>{journal.content}</Text>
              )}
              <Text style={styles.entryTimestamp}>
                {new Date(journal.updatedAt).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })} 에 작성
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.emptyCard}
              onPress={() => setEditorVisible(true)}
              activeOpacity={0.7}
            >
              <Feather name="feather" size={36} color={Colors.disabled} />
              <Text style={styles.emptyTitle}>
                {isToday ? '오늘의 일기를 써보세요' : '이 날의 기록이 없습니다'}
              </Text>
              <Text style={styles.emptySubtext}>
                {isToday
                  ? '하루를 돌아보며 기록을 남겨보세요'
                  : '탭하여 기록을 남길 수 있습니다'}
              </Text>
              <View style={styles.writeBtn}>
                <Feather name="plus" size={16} color={Colors.primary} />
                <Text style={styles.writeBtnText}>일기 쓰기</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <JournalEditorModal
        visible={editorVisible}
        dateStr={selectedDate}
        existing={journal ?? null}
        saving={upsertMutation.isPending}
        onClose={() => setEditorVisible(false)}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  todayBtn: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.sm,
  },
  todayBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },

  calendarCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  navBtn: {
    padding: Spacing.xs,
  },
  monthLabel: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  weekdayText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  calendarLoading: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%` as any,
    alignItems: 'center',
    paddingVertical: 2,
  },
  dayInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayInnerSelected: {
    backgroundColor: Colors.primary,
  },
  dayInnerToday: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  dayText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.text,
  },
  dayTextMuted: {
    color: Colors.disabled,
  },
  dayMood: {
    fontSize: 10,
    height: 14,
    lineHeight: 14,
    textAlign: 'center',
  },
  dayMoodPlaceholder: {
    height: 14,
  },

  journalSection: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  journalDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  journalDateLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  journalDate: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.md,
  },
  loadingArea: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },

  entryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  entryMood: {
    fontSize: 36,
  },
  entryActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionBtn: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background,
  },
  entryTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  entryContent: {
    fontSize: FontSize.md,
    lineHeight: 24,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  entryTimestamp: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'right',
  },

  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  writeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  writeBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
});
