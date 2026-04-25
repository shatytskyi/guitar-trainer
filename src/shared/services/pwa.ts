import { registerSW } from 'virtual:pwa-register';

export interface PWAHandle {
  applyUpdate(): Promise<void>;
}

export function registerPWA(onUpdateAvailable: () => void): PWAHandle {
  const updateSW = registerSW({
    onNeedRefresh() { onUpdateAvailable(); },
    onOfflineReady() { /* no-op for now */ },
    immediate: true,
  });
  return {
    applyUpdate: () => updateSW(true),
  };
}
