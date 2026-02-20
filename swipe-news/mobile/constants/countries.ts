export interface Country {
  id: string;     // "TR", "US", "GB" ...
  label: string;  // "Türkiye"
  flag: string;   // "🇹🇷"
  color: string;  // chip vurgu rengi
}

export const COUNTRIES: Country[] = [
  { id: 'TR', label: 'Türkiye',   flag: '🇹🇷', color: '#DC143C' },
  { id: 'US', label: 'Amerika',   flag: '🇺🇸', color: '#3C3B6E' },
  { id: 'GB', label: 'İngiltere', flag: '🇬🇧', color: '#00247D' },
  { id: 'DE', label: 'Almanya',   flag: '🇩🇪', color: '#333333' },
  { id: 'FR', label: 'Fransa',    flag: '🇫🇷', color: '#002395' },
  { id: 'JP', label: 'Japonya',   flag: '🇯🇵', color: '#BC002D' },
];
