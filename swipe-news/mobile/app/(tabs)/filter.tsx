import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { CATEGORIES, ALL_CATEGORY_IDS } from '../../constants/categories';
import CategoryChip from '../../components/CategoryChip';
import { useNewsStore } from '../../store/useNewsStore';
import { Colors, Spacing, Typography } from '../../constants/theme';

export default function FilterScreen() {
  const { categories: storeCategories, setCategories } = useNewsStore();
  const [selected, setSelected] = useState<string[]>(storeCategories);

  useEffect(() => {
    setSelected(storeCategories);
  }, [storeCategories]);

  const toggleCategory = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelected([]);
  const isAllSelected = selected.length === 0;

  const handleApply = () => {
    setCategories(selected);
    router.push('/(tabs)/');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Kategoriler</Text>
          <Text style={styles.headerSub}>İlgilendiğiniz konuları seçin</Text>
        </View>
        {selected.length > 0 && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedText}>{selected.length} seçili</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>Hangi kategorileri görmek istiyorsunuz?</Text>
        <Text style={styles.sectionSub}>
          Seçim yapmadan tümünü görebilirsiniz
        </Text>

        {/* Tümü chip */}
        <View style={styles.chipsRow}>
          <TouchableOpacity
            style={[styles.allChip, isAllSelected && styles.allChipSelected]}
            onPress={selectAll}
          >
            <Text style={styles.allChipIcon}>🌐</Text>
            <Text style={[styles.allChipLabel, isAllSelected && styles.allChipLabelSelected]}>
              Tümü
            </Text>
          </TouchableOpacity>
        </View>

        {/* Kategori chip'leri */}
        <View style={styles.chipsRow}>
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat.id}
              category={cat}
              selected={selected.includes(cat.id)}
              onPress={toggleCategory}
            />
          ))}
        </View>
      </ScrollView>

      {/* Uygula butonu */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
          <Text style={styles.applyText}>Uygula</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  selectedBadge: {
    borderRadius: 14,
    backgroundColor: Colors.primary + '18',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  selectedText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  content: {
    padding: Spacing.md,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  sectionSub: {
    ...Typography.meta,
    color: Colors.textMuted,
    marginBottom: Spacing.lg,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
  },
  allChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    margin: Spacing.xs,
    backgroundColor: Colors.card,
    minHeight: 44,
  },
  allChipSelected: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  allChipIcon: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  allChipLabel: {
    ...Typography.chip,
    color: Colors.textSecondary,
  },
  allChipLabelSelected: {
    color: '#fff',
  },
  footer: {
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  applyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  applyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
