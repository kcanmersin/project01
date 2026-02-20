export const Colors = {
  primary: '#FF4458',
  primaryLight: '#FF6B7A',
  success: '#4CAF50',
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textMuted: '#999999',
  border: '#EEEEEE',
  tabBar: '#FFFFFF',
  tabBarActive: '#FF4458',
  tabBarInactive: '#999999',
  overlay: {
    left: 'rgba(255, 68, 88, 0.85)',
    right: 'rgba(76, 175, 80, 0.85)',
  },
};

export const Typography = {
  title: { fontSize: 18, fontWeight: '700' as const, lineHeight: 24 },
  summary: { fontSize: 14, lineHeight: 20 },
  meta: { fontSize: 12, lineHeight: 16 },
  chip: { fontSize: 13, fontWeight: '600' as const },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Radius = {
  card: 16,
  chip: 20,
  small: 8,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
};
