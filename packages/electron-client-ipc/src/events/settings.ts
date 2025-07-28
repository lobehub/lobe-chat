import { NetworkProxySettings } from '../types';

export interface DesktopSettingsDispatchEvents {
  getProxySettings: () => NetworkProxySettings;
  setProxySettings: (settings: Partial<NetworkProxySettings>) => void;
  testProxyConfig: (data: { config: NetworkProxySettings; testUrl?: string }) => Promise<{
    message?: string;
    responseTime?: number;
    success: boolean;
  }>;
  testProxyConnection: (url: string) => Promise<{ message?: string; success: boolean }>;
}
