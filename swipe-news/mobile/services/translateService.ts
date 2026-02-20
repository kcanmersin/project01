import axios from 'axios';

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

/** Ülke kodundan kaynak dil tahmini */
export const COUNTRY_LANG_MAP: Record<string, string> = {
  TR: 'tr',
  US: 'en',
  GB: 'en',
  DE: 'de',
  FR: 'fr',
  JP: 'ja',
};

export async function translateText(
  text: string,
  targetLang: string,
  sourceLang: string = 'en'
): Promise<string> {
  const response = await axios.get(MYMEMORY_URL, {
    params: { q: text, langpair: `${sourceLang}|${targetLang}` },
    timeout: 10000,
  });

  const data = response.data;
  if (data.responseStatus !== 200) {
    throw new Error(data.responseDetails ?? 'Çeviri hatası');
  }

  return data.responseData.translationText as string;
}
