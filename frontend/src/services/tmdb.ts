// TMDB Image helpers - only for image URLs
// Movie data comes from backend, but images are served from TMDB CDN

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export type PosterSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';
export type BackdropSize = 'w300' | 'w780' | 'w1280' | 'original';
export type ProfileSize = 'w45' | 'w185' | 'h632' | 'original';

/**
 * Get full TMDB image URL for poster images
 * @param path - Poster path from backend (e.g., "/abc123.jpg")
 * @param size - Image size (default: w500)
 */
export const getImageUrl = (
  path: string | null | undefined,
  size: PosterSize = 'w500'
): string | null => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

/**
 * Get full TMDB image URL for backdrop images
 * @param path - Backdrop path from backend (e.g., "/xyz789.jpg")
 * @param size - Image size (default: w1280)
 */
export const getBackdropUrl = (
  path: string | null | undefined,
  size: BackdropSize = 'w1280'
): string | null => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

/**
 * Get full TMDB image URL for profile/person images
 * @param path - Profile path from backend (e.g., "/person123.jpg")
 * @param size - Image size (default: w185)
 */
export const getProfileUrl = (
  path: string | null | undefined,
  size: ProfileSize = 'w185'
): string | null => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};
