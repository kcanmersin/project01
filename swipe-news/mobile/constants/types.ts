export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  image_url: string | null;
  source: string;
  category: string;
  published_at: string;
}
