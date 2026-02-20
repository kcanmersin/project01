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
import { CATEGORIES } from '../../constants/categories';
import { COUNTRIES } from '../../constants/countries';
import CategoryChip from '../../components/CategoryChip';
import { useNewsStore } from '../../store/useNewsStore';
import { Colors, Spacing, Typography } from '../../constants/theme';

export default function FilterScreen() {
  const { categories: storeCategories, setCategories, countries: storeCountries, setCountries } = useNewsStore();
  const [selected, setSelected] = useState<string[]>(storeCategories);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(storeCountries);

  useEffect(() => {
    setSelected(storeCategories);
  }, [storeCategories]);

  useEffect(() => {
    setSelectedCountries(storeCountries);
  }, [storeCountries]);

  const toggleCategory = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleCountry = (id: string) => {
    setSelectedCountries((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelected([]);
  const isAllSelected = selected.length === 0;

  const selectAllCountries = () => setSelectedCountries([]);
  const isAllCountries = selectedCountries.length === 0;

  const handleApply = () => {
    setCategories(selected);
    setCountries(selectedCountries);
    router.push('/(tabs)/');
  };

  const totalSelected = selected.length + selectedCountries.length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Filtrele</Text>
          <Text style={styles.headerSub}>Ülke ve kategori seçin</Text>
        </View>
        {totalSelected > 0 && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedText}>{totalSelected} seçili</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ── Ülke Bölümü ─────────────────────────────── */}
        <Text style={styles.sectionLabel}>Ülke</Text>
        <Text style={styles.sectionSub}>Hangi ülkelerin haberlerini görmek istiyorsunuz?</Text>

        <View style={styles.chipsRow}>
          {/* Tümü chip */}
          <TouchableOpacity
            style={[styles.allChip, isAllCountries && styles.allChipSelected]}
            onPress={selectAllCountries}
          >
            <Text style={styles.allChipIcon}>🌍</Text>
            <Text style={[styles.allChipLabel, isAllCountries && styles.allChipLabelSelected]}>
              Tümü
            </Text>
          </TouchableOpacity>

          {COUNTRIES.map((country) => {
            const isSelected = selectedCountries.includes(country.id);
            return (
              <TouchableOpacity
                key={country.id}
                style={[
                  styles.countryChip,
                  isSelected && { backgroundColor: country.color + '18', borderColor: country.color },
                ]}
                onPress={() => toggleCountry(country.id)}
              >
                <Text style={styles.countryFlag}>{country.flag}</Text>
                <Text style={[styles.countryLabel, isSelected && { color: country.color, fontWeight: '700' }]}>
                  {country.label}
                </Text>
                {isSelected && (
                  <Text style={[styles.countryCheck, { color: country.color }]}>✓</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divider} />

        {/* ── Kategori Bölümü ──────────────────────────── */}
        <Text style={styles.sectionLabel}>Kategori</Text>
        <Text style={styles.sectionSub}>Seçim yapmadan tümünü görebilirsiniz</Text>

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
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  sectionSub: {
    ...Typography.meta,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
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
  countryChip: {
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
    gap: 4,
  },
  countryFlag: {
    fontSize: 18,
  },
  countryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  countryCheck: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 2,
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
