import { NetworkProxySettings } from '../types';

export interface DesktopSettingsDispatchEvents {
  getProxySettings: () => NetworkProxySettings;
  setProxySettings: (settings: Partial<NetworkProxySettings>) => void;
  testProxyConnection: (url: string) => Promise<{ success: boolean; message?: string }>;
}
