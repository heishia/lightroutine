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
  { value: 'HEALTH', label: 'Health' },
  { value: 'EXERCISE', label: 'Exercise' },
  { value: 'STUDY', label: 'Study' },
  { value: 'LIFESTYLE', label: 'Lifestyle' },
  { value: 'WORK', label: 'Work' },
  { value: 'OTHER', label: 'Other' },
];

const TIME_SLOTS: { value: TimeSlot; label: string }[] = [
  { value: 'MORNING', label: 'Morning' },
  { value: 'AFTERNOON', label: 'Afternoon' },
  { value: 'EVENING', label: 'Evening' },
];

const WEEKDAYS: { value: Weekday; label: string }[] = [
  { value: 'MON', label: 'M' },
  { value: 'TUE', label: 'T' },
  { value: 'WED', label: 'W' },
  { value: 'THU', label: 'T' },
  { value: 'FRI', label: 'F' },
  { value: 'SAT', label: 'S' },
  { value: 'SUN', label: 'S' },
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
      Alert.alert('Error', 'Please enter a routine name');
      return;
    }
    if (repeatDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day');
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
            <Text style={styles.title}>New Routine</Text>

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Morning workout"
              placeholderTextColor={Colors.textTertiary}
              maxLength={100}
            />

            <Text style={styles.label}>Category</Text>
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

            <Text style={styles.label}>Time</Text>
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

            <Text style={styles.label}>Repeat</Text>
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

            <Text style={styles.label}>Color</Text>
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
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <Text style={styles.submitText}>Create</Text>
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
