export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  image_url: string | null;
  source: string;
  category: string;
  country: string;
  published_at: string;
}
