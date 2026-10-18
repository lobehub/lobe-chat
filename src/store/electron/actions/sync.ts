import { isDesktop } from '@lobechat/const';
import { type DataSyncConfig } from '@lobechat/electron-client-ipc';
import isEqual from 'fast-deep-equal';
import { type SWRResponse } from 'swr';
import useSWR from 'swr';

import { resetDataContext } from '@/libs/dataContextReset';
import { mutate } from '@/libs/swr';
import { electronKeys } from '@/libs/swr/keys';
import { remoteServerService } from '@/services/electron/remoteServer';
import { type StoreSetter } from '@/store/types';

import { type ElectronStore } from '../store';

/**
 * Remote server actions
 */

/**
 * Which server the renderer's user data comes from. Other config changes (an
 * inactive config being edited, the auth flow toggling `active` off and on for
 * the same server) do not change what is on screen.
 */
const dataContextOf = ({ active, remoteServerUrl, storageMode }: DataSyncConfig): string =>
  active ? `${storageMode}|${remoteServerUrl ?? ''}` : 'inactive';

type Setter = StoreSetter<ElectronStore>;
export const remoteSyncSlice = (set: Setter, get: () => ElectronStore, _api?: unknown) =>
  new ElectronRemoteServerActionImpl(set, get, _api);

export class ElectronRemoteServerActionImpl {
  readonly #get: () => ElectronStore;
  readonly #set: Setter;
  /** A data-context change seen mid-connect; applied once the flow finishes. */
  #pendingDataContextReset = false;

  constructor(set: Setter, get: () => ElectronStore, _api?: unknown) {
    void _api;
    this.#set = set;
    this.#get = get;
  }

  clearRemoteServerSyncError = (): void => {
    this.#set({ remoteServerSyncError: undefined }, false, 'clearRemoteServerSyncError');
  };

  connectRemoteServer = async (values: DataSyncConfig): Promise<void> => {
    if (values.storageMode === 'selfHost' && !values.remoteServerUrl) return;

    this.#set({ isConnectingServer: true });
    this.#get().clearRemoteServerSyncError();
    try {
      // Get current configuration
      const config = await remoteServerService.getRemoteServerConfig();

      // If already active, need to clear first
      if (!isEqual(config, values)) {
        await remoteServerService.setRemoteServerConfig({ ...values, active: false });
      }

      // Request authorization
      const result = await remoteServerService.requestAuthorization(values);

      if (!result.success) {
        console.error('Authorization request failed:', result.error);

        this.#set({
          remoteServerSyncError: { message: result.error, type: 'AUTH_ERROR' },
        });
      }
      // Refresh state
      await this.#get().refreshServerConfig();
    } catch (error) {
      console.error('Remote server configuration error:', error);
      this.#set({
        remoteServerSyncError: { message: (error as Error).message, type: 'CONFIG_ERROR' },
      });
    } finally {
      this.#set({ isConnectingServer: false });
      if (this.#pendingDataContextReset) {
        this.#pendingDataContextReset = false;
        await resetDataContext();
      }
    }
  };

  disconnectRemoteServer = async (): Promise<void> => {
    this.#set({ isConnectingServer: false });
    this.#get().clearRemoteServerSyncError();
    try {
      // Must use clearRemoteServerConfig (not only set active: false): main process
      // clears encrypted OIDC access/refresh tokens; otherwise sign-out still leaves auth state.
      await remoteServerService.clearRemoteServerConfig();
      // Nothing of the previous server's data may stay: reload every renderer.
      await resetDataContext();
    } catch (error) {
      console.error('Disconnect failed:', error);
      this.#set({
        remoteServerSyncError: { message: (error as Error).message, type: 'DISCONNECT_ERROR' },
      });
    } finally {
      this.#set({ isConnectingServer: false });
    }
  };

  refreshServerConfig = async (): Promise<void> => {
    await mutate(electronKeys.remoteServerConfig());
  };

  useDataSyncConfig = (): SWRResponse => {
    return useSWR<DataSyncConfig>(
      // Desktop-only IPC: on web there is no electronAPI, so never fetch off-desktop.
      isDesktop ? electronKeys.remoteServerConfig() : null,
      async () => {
        try {
          return await remoteServerService.getRemoteServerConfig();
        } catch (error) {
          console.error('Failed to get remote server configuration:', error);
          throw error;
        }
      },
      {
        onSuccess: (data) => {
          const { dataSyncConfig, isConnectingServer, isInitRemoteServerConfig } = this.#get();
          this.#set({ dataSyncConfig: data, isInitRemoteServerConfig: true });
          // Only after the first hydration: on initial load the renderer already
          // holds this server's data.
          if (!isInitRemoteServerConfig || dataContextOf(data) === dataContextOf(dataSyncConfig))
            return;
          // The connect flow toggles the config while it authorizes; reloading
          // mid-flow would drop its progress and error state. It resets when done.
          if (isConnectingServer) {
            this.#pendingDataContextReset = true;
            return;
          }
          void resetDataContext().catch((error) => {
            console.error('Failed to reset the data context:', error);
          });
        },
      },
    );
  };
}

export type ElectronRemoteServerAction = Pick<
  ElectronRemoteServerActionImpl,
  keyof ElectronRemoteServerActionImpl
>;
