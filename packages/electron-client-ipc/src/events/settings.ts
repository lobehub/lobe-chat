import { NetworkProxySettings } from '../types';

export interface DesktopSettingsDispatchEvents {
  getAutoUpdateNotificationEnabled: () => boolean;
  getProxySettings: () => NetworkProxySettings;
  setAutoUpdateNotificationEnabled: (enabled: boolean) => void;
  setProxySettings: (settings: Partial<NetworkProxySettings>) => void;
  testProxyConfig: (data: { config: NetworkProxySettings; testUrl?: string }) => Promise<{
    message?: string;
    responseTime?: number;
    success: boolean;
  }>;
  testProxyConnection: (url: string) => Promise<{ message?: string; success: boolean }>;
}
