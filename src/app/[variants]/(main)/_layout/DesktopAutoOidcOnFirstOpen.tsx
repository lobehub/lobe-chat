'use client';

import { memo, useEffect } from 'react';

import { useElectronStore } from '@/store/electron';

const STORAGE_KEY = 'lobechat:desktop:auto-oidc:first-open:v1';

/**
 * Desktop-only bootstrap: auto invoke OIDC authorization on the very first app open.
 *
 * Note: we intentionally keep this outside of `Connection` UI to avoid coupling business flow to UI.
 */
const DesktopAutoOidcOnFirstOpen = memo(() => {
  const [isInitRemoteServerConfig, dataSyncConfig, useDataSyncConfig, connectRemoteServer] =
    useElectronStore((s) => [
      s.isInitRemoteServerConfig,
      s.dataSyncConfig,
      s.useDataSyncConfig,
      s.connectRemoteServer,
    ]);

  // Ensure config is loaded early.
  useDataSyncConfig();

  useEffect(() => {
    // Desktop runtime guard
    if (process.env.NEXT_PUBLIC_IS_DESKTOP_APP !== '1') return;
    if (typeof window === 'undefined') return;
    if (!isInitRemoteServerConfig) return;

    // If already connected or not in cloud mode, don't auto-trigger.
    if (dataSyncConfig.active) return;
    if (dataSyncConfig.storageMode !== 'cloud') return;

    try {
      if (window.localStorage.getItem(STORAGE_KEY) === '1') return;
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // If localStorage is unavailable, don't auto-invoke to avoid repeated prompts.
      return;
    }

    // This will trigger IPC -> main process -> `shell.openExternal(/oidc/auth...)`.
    connectRemoteServer({ remoteServerUrl: dataSyncConfig.remoteServerUrl, storageMode: 'cloud' });
  }, [
    connectRemoteServer,
    dataSyncConfig.active,
    dataSyncConfig.remoteServerUrl,
    dataSyncConfig.storageMode,
    isInitRemoteServerConfig,
  ]);

  return null;
});

export default DesktopAutoOidcOnFirstOpen;


