export interface FeatureSupport {
  audioWorklet: boolean;
  webSpeech: boolean;
  wasm: boolean;
  mediaSession: boolean;
  vibration: boolean;
  indexedDB: boolean;
  serviceWorker: boolean;
  offscreenCanvas: boolean;
}

export function detectFeatures(): FeatureSupport {
  return {
    audioWorklet: typeof AudioWorkletNode !== 'undefined',
    webSpeech: typeof speechSynthesis !== 'undefined',
    wasm: typeof WebAssembly !== 'undefined',
    mediaSession: 'mediaSession' in navigator,
    vibration: 'vibrate' in navigator,
    indexedDB: typeof indexedDB !== 'undefined',
    serviceWorker: 'serviceWorker' in navigator,
    offscreenCanvas: typeof OffscreenCanvas !== 'undefined',
  };
}
