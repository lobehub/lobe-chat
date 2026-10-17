import { isDesktop } from '@lobechat/const';
import type { GatewayConnectionStatus } from '@lobechat/electron-client-ipc';
import { type SWRResponse } from 'swr';
import useSWR from 'swr';

import { electronKeys } from '@/libs/swr/keys';
import { gatewayConnectionService } from '@/services/electron/gatewayConnection';
import { type StoreSetter } from '@/store/types';

import { type ElectronStore } from '../store';

type Setter = StoreSetter<ElectronStore>;
export const gatewaySlice = (set: Setter, get: () => ElectronStore, _api?: unknown) =>
  new ElectronGatewayActionImpl(set, get, _api);

export interface GatewayDeviceInfo {
  deviceId: string;
  hostname: string;
  platform: string;
}

export class ElectronGatewayActionImpl {
  readonly #get: () => ElectronStore;
  readonly #set: Setter;

  constructor(set: Setter, get: () => ElectronStore, _api?: unknown) {
    void _api;
    this.#get = get;
    this.#set = set;
  }

  connectGateway = async (): Promise<void> => {
    this.#set({ gatewayConnectionStatus: 'connecting' });
    try {
      const result = await gatewayConnectionService.connect();
      if (!result.success) {
        this.#set({ gatewayConnectionStatus: 'disconnected' });
      }
    } catch (error) {
      console.error('Gateway connect failed:', error);
      this.#set({ gatewayConnectionStatus: 'disconnected' });
    }
  };

  disconnectGateway = async (): Promise<void> => {
    try {
      await gatewayConnectionService.disconnect();
      this.#set({ gatewayConnectionStatus: 'disconnected' });
    } catch (error) {
      console.error('Gateway disconnect failed:', error);
    }
  };

  setGatewayConnectionStatus = (status: GatewayConnectionStatus): void => {
    this.#set({ gatewayConnectionStatus: status }, false, 'setGatewayConnectionStatus');
  };

  /**
   * This desktop's gateway device id, asked over IPC when the SWR hook has not
   * filled the store yet. Writes that pin a topic's cwd must name its machine,
   * and a send or CLI session can land before any picker has mounted.
   */
  resolveGatewayDeviceId = async (): Promise<string | undefined> => {
    if (!isDesktop) return;
    const cached = this.#get().gatewayDeviceInfo?.deviceId;
    if (cached) return cached;
    try {
      const info = (await gatewayConnectionService.getDeviceInfo()) as GatewayDeviceInfo;
      if (!info?.deviceId) return;
      this.#set({ gatewayDeviceInfo: info }, false, 'setGatewayDeviceInfo');
      return info.deviceId;
    } catch (error) {
      console.error('Gateway device info fetch failed:', error);
      return;
    }
  };

  useFetchGatewayDeviceInfo = (): SWRResponse<GatewayDeviceInfo> => {
    return useSWR<GatewayDeviceInfo>(
      // Desktop-only IPC: on web there is no electronAPI, so never fetch off-desktop.
      isDesktop ? electronKeys.gatewayDeviceInfo() : null,
      async () => gatewayConnectionService.getDeviceInfo() as Promise<GatewayDeviceInfo>,
      {
        onSuccess: (data) => {
          this.#set({ gatewayDeviceInfo: data }, false, 'setGatewayDeviceInfo');
        },
      },
    );
  };

  useFetchGatewayStatus = (): SWRResponse<{ status: GatewayConnectionStatus }> => {
    return useSWR<{ status: GatewayConnectionStatus }>(
      isDesktop ? 'electron:getGatewayConnectionStatus' : null,
      async () => gatewayConnectionService.getConnectionStatus(),
      {
        onSuccess: (data) => {
          this.#set({ gatewayConnectionStatus: data.status }, false, 'setGatewayConnectionStatus');
        },
      },
    );
  };
}

export type ElectronGatewayAction = Pick<
  ElectronGatewayActionImpl,
  keyof ElectronGatewayActionImpl
>;
