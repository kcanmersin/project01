import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputSelectionChangeEventData,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';
import { translateText } from '../services/translateService';

interface Props {
  visible: boolean;
  text: string;
  sourceLang?: string;
  onClose: () => void;
}

const TARGET_LANGS = [
  { code: 'tr', label: 'Türkçe' },
  { code: 'en', label: 'İngilizce' },
  { code: 'de', label: 'Almanca' },
  { code: 'fr', label: 'Fransızca' },
];

export default function TranslateModal({ visible, text, sourceLang = 'en', onClose }: Props) {
  const [targetLang, setTargetLang] = useState('tr');
  const [editableText, setEditableText] = useState(text);
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  /* text prop değişince (yeni long press) sıfırla */
  React.useEffect(() => {
    if (visible) {
      setEditableText(text);
      setTranslation('');
      setError('');
    }
  }, [visible, text]);

  const handleSelectionChange = (
    e: NativeSyntheticEvent<TextInputSelectionChangeEventData>
  ) => {
    selectionRef.current = e.nativeEvent.selection;
  };

  const getTextToTranslate = (): string => {
    const { start, end } = selectionRef.current;
    if (start !== end) {
      return editableText.slice(start, end).trim();
    }
    return editableText.trim();
  };

  const handleTranslate = async () => {
    const query = getTextToTranslate();
    if (!query) return;

    setLoading(true);
    setTranslation('');
    setError('');
    try {
      const result = await translateText(query, targetLang, sourceLang);
      setTranslation(result);
    } catch {
      setError('Çeviri başarısız. İnternet bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTranslation('');
    setError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      {/* Üst boşluğa dokunulunca kapat */}
      <Pressable style={styles.backdrop} onPress={handleClose} />

      <View style={styles.sheet}>
        {/* Handle bar */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🌐 Çeviri</Text>
          <TouchableOpacity onPress={handleClose} hitSlop={12}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          Kelime veya cümle seçip çevir butonuna bas
        </Text>

        {/* Düzenlenebilir kaynak metin */}
        <TextInput
          style={styles.sourceInput}
          value={editableText}
          onChangeText={setEditableText}
          multiline
          scrollEnabled
          onSelectionChange={handleSelectionChange}
          autoCorrect={false}
          spellCheck={false}
          textAlignVertical="top"
          placeholder="Çevrilecek metin..."
          placeholderTextColor={Colors.textMuted}
        />

        {/* Hedef dil seçici */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.langScroll}
          contentContainerStyle={styles.langRow}
        >
          {TARGET_LANGS.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[styles.langChip, targetLang === lang.code && styles.langChipActive]}
              onPress={() => setTargetLang(lang.code)}
            >
              <Text
                style={[styles.langLabel, targetLang === lang.code && styles.langLabelActive]}
              >
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Çevir butonu */}
        <TouchableOpacity
          style={[styles.translateBtn, loading && styles.translateBtnDisabled]}
          onPress={handleTranslate}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.translateBtnLabel}>Çevir</Text>
          )}
        </TouchableOpacity>

        {/* Hata */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Çeviri sonucu */}
        {translation ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Çeviri</Text>
            <ScrollView style={styles.resultScroll} nestedScrollEnabled>
              <Text style={styles.resultText} selectable>
                {translation}
              </Text>
            </ScrollView>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
    maxHeight: '80%',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  closeBtn: {
    fontSize: 16,
    color: Colors.textMuted,
    padding: 4,
  },
  hint: {
    ...Typography.meta,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  sourceInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.small,
    padding: Spacing.sm,
    ...Typography.summary,
    color: Colors.text,
    minHeight: 80,
    maxHeight: 140,
    backgroundColor: '#FAFAFA',
    marginBottom: Spacing.sm,
  },
  langScroll: {
    marginBottom: Spacing.sm,
  },
  langRow: {
    gap: Spacing.xs,
    paddingRight: Spacing.xs,
  },
  langChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.chip,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#fff',
  },
  langChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  langLabel: {
    ...Typography.meta,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  langLabelActive: {
    color: '#fff',
  },
  translateBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.small,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  translateBtnDisabled: {
    opacity: 0.7,
  },
  translateBtnLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  errorText: {
    ...Typography.meta,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  resultBox: {
    borderTopWidth: 1,
    borderColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  resultLabel: {
    ...Typography.meta,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultScroll: {
    maxHeight: 120,
  },
  resultText: {
    ...Typography.summary,
    color: Colors.text,
    lineHeight: 22,
  },
});
