export interface Category {
  id: string;
  label: string;
  color: string;
  gradient: [string, string];
  icon: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'gundem',
    label: 'Gündem',
    color: '#FF5252',
    gradient: ['#FF5252', '#FF1744'],
    icon: '📰',
  },
  {
    id: 'teknoloji',
    label: 'Teknoloji',
    color: '#2196F3',
    gradient: ['#2196F3', '#1565C0'],
    icon: '💻',
  },
  {
    id: 'spor',
    label: 'Spor',
    color: '#4CAF50',
    gradient: ['#4CAF50', '#2E7D32'],
    icon: '⚽',
  },
  {
    id: 'ekonomi',
    label: 'Ekonomi',
    color: '#FF9800',
    gradient: ['#FF9800', '#E65100'],
    icon: '📈',
  },
  {
    id: 'dunya',
    label: 'Dünya',
    color: '#9C27B0',
    gradient: ['#9C27B0', '#6A1B9A'],
    icon: '🌍',
  },
  {
    id: 'bilim',
    label: 'Bilim',
    color: '#00BCD4',
    gradient: ['#00BCD4', '#006064'],
    icon: '🔬',
  },
];

export const ALL_CATEGORY_IDS = CATEGORIES.map((c) => c.id);

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
