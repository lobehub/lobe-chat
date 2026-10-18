import type { DataSyncConfig } from '@lobechat/electron-client-ipc';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useElectronStore } from '@/store/electron';

const resetDataContext = vi.hoisted(() => vi.fn(async () => undefined));
const useSWR = vi.hoisted(() => vi.fn((..._args: unknown[]) => ({})));
const remoteServerService = vi.hoisted(() => ({
  clearRemoteServerConfig: vi.fn(async () => true),
  getRemoteServerConfig: vi.fn(),
  requestAuthorization: vi.fn(),
  setRemoteServerConfig: vi.fn(async () => true),
}));

vi.mock('@lobechat/const', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  isDesktop: true,
}));
vi.mock('@/libs/dataContextReset', () => ({ resetDataContext }));
vi.mock('@/libs/swr', () => ({ mutate: vi.fn(async () => undefined) }));
vi.mock('@/services/electron/remoteServer', () => ({ remoteServerService }));
vi.mock('swr', () => ({ default: useSWR }));

const SERVER_A: DataSyncConfig = {
  active: true,
  remoteServerUrl: 'https://a.example',
  storageMode: 'selfHost',
};
const SERVER_B: DataSyncConfig = { ...SERVER_A, remoteServerUrl: 'https://b.example' };

/** Play the remote-server-config SWR answering `data`. */
const answerConfig = (data: DataSyncConfig) => {
  useElectronStore.getState().useDataSyncConfig();
  const [, , options] = useSWR.mock.calls.at(-1) as [
    unknown,
    unknown,
    { onSuccess: (data: DataSyncConfig) => void },
  ];
  options.onSuccess(data);
};

beforeEach(() => {
  vi.clearAllMocks();
  useElectronStore.setState({
    dataSyncConfig: { storageMode: 'cloud' },
    isConnectingServer: false,
    isInitRemoteServerConfig: false,
  });
});

describe('remote server data context', () => {
  it('does not reset on the first config hydration', () => {
    answerConfig(SERVER_A);

    expect(resetDataContext).not.toHaveBeenCalled();
  });

  it('resets (reloads every renderer) when the server changes', () => {
    answerConfig(SERVER_A);

    answerConfig(SERVER_B);

    expect(resetDataContext).toHaveBeenCalledTimes(1);
  });

  it('ignores config changes that keep the same server', () => {
    answerConfig({ ...SERVER_A, active: false });
    answerConfig({ ...SERVER_A, active: false, remoteServerUrl: 'https://draft.example' });

    expect(resetDataContext).not.toHaveBeenCalled();
  });

  it('defers the reset of a switch seen mid-connect until the flow finishes', async () => {
    answerConfig(SERVER_A);
    remoteServerService.getRemoteServerConfig.mockResolvedValue(SERVER_A);
    let authorize!: (result: { success: boolean }) => void;
    remoteServerService.requestAuthorization.mockReturnValue(
      new Promise((resolve) => {
        authorize = resolve;
      }),
    );

    const connecting = useElectronStore.getState().connectRemoteServer(SERVER_B);
    await vi.waitFor(() => expect(remoteServerService.requestAuthorization).toHaveBeenCalled());
    // The flow deactivates the old server while it authorizes the new one.
    answerConfig({ ...SERVER_A, active: false });
    expect(resetDataContext).not.toHaveBeenCalled();

    authorize({ success: true });
    await connecting;

    expect(resetDataContext).toHaveBeenCalledTimes(1);
  });

  it('resets after disconnecting from the server', async () => {
    await useElectronStore.getState().disconnectRemoteServer();

    expect(remoteServerService.clearRemoteServerConfig).toHaveBeenCalled();
    expect(resetDataContext).toHaveBeenCalledTimes(1);
  });
});
