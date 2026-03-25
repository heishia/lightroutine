import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/colors';
import type { JournalResponse } from '@lightroutine/types';

const MOOD_OPTIONS = [
  { emoji: '😊', label: '기쁨' },
  { emoji: '😌', label: '평온' },
  { emoji: '😐', label: '보통' },
  { emoji: '😤', label: '화남' },
  { emoji: '😢', label: '슬픔' },
  { emoji: '😴', label: '피곤' },
  { emoji: '🤩', label: '설렘' },
  { emoji: '💪', label: '뿌듯' },
];

interface Props {
  visible: boolean;
  dateStr: string;
  existing: JournalResponse | null;
  saving: boolean;
  onClose: () => void;
  onSave: (data: { mood: string; title: string; content: string }) => void;
}

export function JournalEditorModal({ visible, dateStr, existing, saving, onClose, onSave }: Props) {
  const [mood, setMood] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (visible) {
      setMood(existing?.mood ?? '');
      setTitle(existing?.title ?? '');
      setContent(existing?.content ?? '');
    }
  }, [visible, existing]);

  const isValid = mood.length > 0 && title.trim().length > 0;

  const handleSave = () => {
    if (!isValid || saving) return;
    onSave({ mood, title: title.trim(), content: content.trim() });
  };

  const formatDisplayDate = (ds: string) => {
    const d = new Date(ds);
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    return `${m}월 ${day}일 (${weekdays[d.getDay()]})`;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Feather name="x" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerDate}>{formatDisplayDate(dateStr)}</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
            disabled={!isValid || saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>저장</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
          {/* Mood Selector */}
          <Text style={styles.sectionLabel}>오늘의 기분</Text>
          <View style={styles.moodGrid}>
            {MOOD_OPTIONS.map((m) => (
              <TouchableOpacity
                key={m.emoji}
                style={[styles.moodItem, mood === m.emoji && styles.moodItemSelected]}
                onPress={() => setMood(m.emoji)}
                activeOpacity={0.7}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[styles.moodLabel, mood === m.emoji && styles.moodLabelSelected]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Title */}
          <Text style={styles.sectionLabel}>제목</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="오늘 하루를 한 줄로"
            placeholderTextColor={Colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            maxLength={200}
          />

          {/* Content */}
          <Text style={styles.sectionLabel}>내용</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="오늘 하루는 어땠나요?"
            placeholderTextColor={Colors.textTertiary}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            maxLength={5000}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerBtn: {
    padding: Spacing.xs,
  },
  headerDate: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.sm,
    minWidth: 56,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: Colors.disabled,
  },
  saveBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  body: {
    flex: 1,
    padding: Spacing.lg,
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  moodItem: {
    alignItems: 'center',
    width: 68,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  moodItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  moodLabelSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  titleInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contentInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 200,
    marginBottom: Spacing.xxl,
  },
});
