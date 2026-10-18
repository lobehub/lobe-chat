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

/**
 * Set while a window runs the connect flow, shared by every renderer. That
 * window owns the data-context reset: every window sees the config toggle
 * mid-flow, and a follower resetting on its own would reload the initiator
 * (through the shared reset epoch) before authorization finishes. A stale mark
 * (a crashed flow) expires.
 */
const AUTHORIZING_KEY = 'lobe-remote-server-authorizing';
const AUTHORIZING_TTL = 15 * 60 * 1000;

const setAuthorizing = (active: boolean): void => {
  try {
    if (active) localStorage.setItem(AUTHORIZING_KEY, String(Date.now()));
    else localStorage.removeItem(AUTHORIZING_KEY);
  } catch {
    // Storage unavailable: followers fall back to resetting on their own.
  }
};

const isAuthorizingElsewhere = (): boolean => {
  try {
    const since = Number(localStorage.getItem(AUTHORIZING_KEY));
    return since > 0 && Date.now() - since < AUTHORIZING_TTL;
  } catch {
    return false;
  }
};

type RemoteServerSyncError = NonNullable<ElectronStore['remoteServerSyncError']>;

/**
 * A connect flow that fails after it already left the previous server still
 * has to reload, which recreates this store. Its error rides the reload in
 * sessionStorage (scoped to this window) so the login screen can show it.
 */
const SYNC_ERROR_STASH_KEY = 'lobe-remote-server-sync-error';

const stashSyncError = (error: RemoteServerSyncError): void => {
  try {
    sessionStorage.setItem(SYNC_ERROR_STASH_KEY, JSON.stringify(error));
  } catch {
    // Storage unavailable: the reload still has to happen.
  }
};

const takeStashedSyncError = (): RemoteServerSyncError | undefined => {
  try {
    const stashed = sessionStorage.getItem(SYNC_ERROR_STASH_KEY);
    sessionStorage.removeItem(SYNC_ERROR_STASH_KEY);
    return stashed ? (JSON.parse(stashed) as RemoteServerSyncError) : undefined;
  } catch {
    return undefined;
  }
};

type Setter = StoreSetter<ElectronStore>;
export const remoteSyncSlice = (set: Setter, get: () => ElectronStore, _api?: unknown) =>
  new ElectronRemoteServerActionImpl(set, get, _api);

export class ElectronRemoteServerActionImpl {
  readonly #get: () => ElectronStore;
  readonly #set: Setter;
  /** Which server the data on screen comes from (`dataContextOf`), once hydrated. */
  #shownContext: string | undefined;

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

    // The context on screen before the flow; this window resets if it changed.
    const contextBefore = this.#shownContext ?? dataContextOf(this.#get().dataSyncConfig);
    this.#set({ isConnectingServer: true });
    setAuthorizing(true);
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
      let changed = true;
      try {
        changed =
          dataContextOf(await remoteServerService.getRemoteServerConfig()) !== contextBefore;
      } catch {
        // Unknown outcome: reset rather than keep possibly foreign data on screen.
      }
      this.#set({ isConnectingServer: false });
      setAuthorizing(false);
      if (changed) {
        const { remoteServerSyncError } = this.#get();
        if (remoteServerSyncError) stashSyncError(remoteServerSyncError);
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
          const { isConnectingServer, isInitRemoteServerConfig } = this.#get();
          // The first hydration after a reload restores a connect error it carried.
          const stashedError = isInitRemoteServerConfig ? undefined : takeStashedSyncError();
          this.#set({
            dataSyncConfig: data,
            isInitRemoteServerConfig: true,
            ...(stashedError && { remoteServerSyncError: stashedError }),
          });
          const context = dataContextOf(data);
          // On the first hydration the renderer already holds this server's data.
          if (!isInitRemoteServerConfig || this.#shownContext === undefined)
            this.#shownContext = context;
          if (context === this.#shownContext) return;
          // A connect flow (in this window or another) toggles the config while it
          // authorizes and owns the reset; reloading mid-flow would abort it. Its
          // reset reloads this window through the shared epoch. The baseline stays,
          // so a flow that ends on the same server reloads nothing.
          if (isConnectingServer || isAuthorizingElsewhere()) return;
          this.#shownContext = context;
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
