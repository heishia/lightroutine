import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/colors';
import type { RoutineResponse } from '@lightroutine/types';

interface Props {
  routine: RoutineResponse;
  completed: boolean;
  onToggle: () => void;
  onPress: () => void;
}

const TIME_SLOT_LABELS: Record<string, string> = {
  MORNING: '아침',
  AFTERNOON: '오후',
  EVENING: '저녁',
};

export function RoutineItem({ routine, completed, onToggle, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <TouchableOpacity
        style={[
          styles.checkbox,
          { borderColor: routine.color },
          completed && { backgroundColor: routine.color },
        ]}
        onPress={onToggle}
      >
        {completed && <Text style={styles.checkmark}>{'v'}</Text>}
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={[styles.name, completed && styles.nameCompleted]}>{routine.name}</Text>
        <Text style={styles.meta}>
          {TIME_SLOT_LABELS[routine.timeSlot] || routine.timeSlot}
          {' / '}
          {routine.repeatDays.join(', ')}
        </Text>
      </View>

      <View style={[styles.colorDot, { backgroundColor: routine.color }]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  nameCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textTertiary,
  },
  meta: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.sm,
  },
});
