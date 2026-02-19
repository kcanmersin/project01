import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const INTERSTITIAL_ID =
  process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID ?? TestIds.INTERSTITIAL;

let interstitial: InterstitialAd | null = null;
let isLoaded = false;

function createAd(): void {
  interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_ID, {
    requestNonPersonalizedAdsOnly: true,
  });

  interstitial.addAdEventListener(AdEventType.LOADED, () => {
    isLoaded = true;
  });

  interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    isLoaded = false;
    // Bir sonraki reklam için yeniden yükle
    loadInterstitial();
  });

  interstitial.addAdEventListener(AdEventType.ERROR, () => {
    isLoaded = false;
  });
}

export function loadInterstitial(): void {
  try {
    if (!interstitial) createAd();
    interstitial?.load();
  } catch {
    // Reklam yüklenemezse sessizce geç
  }
}

export async function showInterstitialIfReady(): Promise<void> {
  try {
    if (interstitial && isLoaded) {
      interstitial.show();
    }
  } catch {
    // Gösterilemezse sessizce geç
  }
}
