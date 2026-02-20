import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Category } from '../constants/categories';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

interface Props {
  category: Category;
  selected: boolean;
  onPress: (id: string) => void;
}

export default function CategoryChip({ category, selected, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && { backgroundColor: category.color }]}
      onPress={() => onPress(category.id)}
      activeOpacity={0.75}
    >
      <Text style={styles.icon}>{category.icon}</Text>
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {category.label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.chip,
    borderWidth: 1.5,
    borderColor: Colors.border,
    margin: Spacing.xs,
    backgroundColor: Colors.card,
    minHeight: 44,
  },
  icon: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  label: {
    ...Typography.chip,
    color: Colors.textSecondary,
  },
  labelSelected: {
    color: '#fff',
  },
});
