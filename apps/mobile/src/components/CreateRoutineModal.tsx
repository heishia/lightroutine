import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/colors';
import { ROUTINE_COLORS } from '@lightroutine/types';
import type { Weekday, TimeSlot, RoutineCategory } from '@lightroutine/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    category: RoutineCategory;
    timeSlot: TimeSlot;
    color: string;
    repeatDays: Weekday[];
  }) => void;
}

const CATEGORIES: { value: RoutineCategory; label: string }[] = [
  { value: 'HEALTH', label: '건강' },
  { value: 'EXERCISE', label: '운동' },
  { value: 'STUDY', label: '공부' },
  { value: 'LIFESTYLE', label: '생활' },
  { value: 'WORK', label: '업무' },
  { value: 'OTHER', label: '기타' },
];

const TIME_SLOTS: { value: TimeSlot; label: string }[] = [
  { value: 'MORNING', label: '아침' },
  { value: 'AFTERNOON', label: '오후' },
  { value: 'EVENING', label: '저녁' },
];

const WEEKDAYS: { value: Weekday; label: string }[] = [
  { value: 'MON', label: '월' },
  { value: 'TUE', label: '화' },
  { value: 'WED', label: '수' },
  { value: 'THU', label: '목' },
  { value: 'FRI', label: '금' },
  { value: 'SAT', label: '토' },
  { value: 'SUN', label: '일' },
];

export function CreateRoutineModal({ visible, onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<RoutineCategory>('HEALTH');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('MORNING');
  const [color, setColor] = useState(ROUTINE_COLORS[0]);
  const [repeatDays, setRepeatDays] = useState<Weekday[]>([
    'MON', 'TUE', 'WED', 'THU', 'FRI',
  ]);

  const toggleDay = (day: Weekday) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('오류', '루틴 이름을 입력해 주세요');
      return;
    }
    if (repeatDays.length === 0) {
      Alert.alert('오류', '최소 하루 이상 선택해 주세요');
      return;
    }
    onSubmit({ name: name.trim(), category, timeSlot, color, repeatDays });
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setCategory('HEALTH');
    setTimeSlot('MORNING');
    setColor(ROUTINE_COLORS[0]);
    setRepeatDays(['MON', 'TUE', 'WED', 'THU', 'FRI']);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>새 루틴</Text>

            <Text style={styles.label}>이름</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="예: 아침 운동"
              placeholderTextColor={Colors.textTertiary}
              maxLength={100}
            />

            <Text style={styles.label}>카테고리</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.value}
                  style={[styles.chip, category === c.value && styles.chipActive]}
                  onPress={() => setCategory(c.value)}
                >
                  <Text
                    style={[styles.chipText, category === c.value && styles.chipTextActive]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>시간대</Text>
            <View style={styles.chipRow}>
              {TIME_SLOTS.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  style={[styles.chip, timeSlot === t.value && styles.chipActive]}
                  onPress={() => setTimeSlot(t.value)}
                >
                  <Text
                    style={[styles.chipText, timeSlot === t.value && styles.chipTextActive]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>반복 요일</Text>
            <View style={styles.dayRow}>
              {WEEKDAYS.map((d) => (
                <TouchableOpacity
                  key={d.value}
                  style={[styles.dayChip, repeatDays.includes(d.value) && styles.dayChipActive]}
                  onPress={() => toggleDay(d.value)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      repeatDays.includes(d.value) && styles.dayTextActive,
                    ]}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>색상</Text>
            <View style={styles.colorRow}>
              {ROUTINE_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c },
                    color === c && styles.colorDotActive,
                  ]}
                  onPress={() => setColor(c)}
                />
              ))}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <Text style={styles.submitText}>만들기</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '85%',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayChip: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipActive: {
    backgroundColor: Colors.primary,
  },
  dayText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  colorRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
  },
  colorDotActive: {
    borderWidth: 3,
    borderColor: Colors.text,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  cancelBtn: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  submitText: {
    fontSize: FontSize.md,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
