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
const LEFT_A: DataSyncConfig = { ...SERVER_A, active: false };
const AUTHORIZING_KEY = 'lobe-remote-server-authorizing';

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

/** Start a connect flow to `target` and hold it at authorization. */
const startConnect = async (target: DataSyncConfig) => {
  let authorize!: (result: { error?: string; success: boolean }) => void;
  remoteServerService.requestAuthorization.mockReturnValue(
    new Promise((resolve) => {
      authorize = resolve;
    }),
  );
  const connecting = useElectronStore.getState().connectRemoteServer(target);
  await vi.waitFor(() => expect(remoteServerService.requestAuthorization).toHaveBeenCalled());
  return { authorize, connecting };
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  useElectronStore.setState({
    dataSyncConfig: { storageMode: 'cloud' },
    isConnectingServer: false,
    isInitRemoteServerConfig: false,
    remoteServerSyncError: undefined,
  });
});

describe('remote server data context', () => {
  it('does not reset on the first config hydration', () => {
    answerConfig(SERVER_A);

    expect(resetDataContext).not.toHaveBeenCalled();
  });

  it('resets when the server changes outside a connect flow', () => {
    answerConfig(SERVER_A);

    answerConfig(SERVER_B);

    expect(resetDataContext).toHaveBeenCalledTimes(1);
  });

  it('ignores config changes that keep the same server', () => {
    answerConfig(LEFT_A);
    answerConfig({ ...LEFT_A, remoteServerUrl: 'https://draft.example' });

    expect(resetDataContext).not.toHaveBeenCalled();
  });

  it('lets the connecting window own the reset and resets once the flow ends', async () => {
    answerConfig(SERVER_A);
    remoteServerService.getRemoteServerConfig.mockResolvedValue(SERVER_A);
    const { authorize, connecting } = await startConnect(SERVER_B);
    answerConfig(LEFT_A); // the flow leaves server A while it authorizes
    expect(resetDataContext).not.toHaveBeenCalled();

    remoteServerService.getRemoteServerConfig.mockResolvedValue(SERVER_B);
    authorize({ success: true });
    await connecting;

    expect(resetDataContext).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(AUTHORIZING_KEY)).toBeNull();
  });

  it('does not reset a follower window while another window authorizes', () => {
    answerConfig(SERVER_A);
    // Another window (e.g. a chat window) is running the connect flow.
    localStorage.setItem(AUTHORIZING_KEY, String(Date.now()));

    answerConfig(LEFT_A);
    expect(resetDataContext).not.toHaveBeenCalled();

    // The flow ends back on server A: this window holds the right data already.
    localStorage.removeItem(AUTHORIZING_KEY);
    answerConfig(SERVER_A);
    expect(resetDataContext).not.toHaveBeenCalled();
  });

  it('does not reload when a reconnect ends on the same server', async () => {
    answerConfig(SERVER_A);
    remoteServerService.getRemoteServerConfig.mockResolvedValue(SERVER_A);
    const { authorize, connecting } = await startConnect(SERVER_A);

    authorize({ success: true });
    await connecting;

    expect(resetDataContext).not.toHaveBeenCalled();
  });

  it('keeps an authorization error across the reload of a failed switch', async () => {
    answerConfig(SERVER_A);
    remoteServerService.getRemoteServerConfig.mockResolvedValue(SERVER_A);
    const { authorize, connecting } = await startConnect(SERVER_B);

    remoteServerService.getRemoteServerConfig.mockResolvedValue(LEFT_A); // left A, B failed
    authorize({ error: 'denied by user', success: false });
    await connecting;
    expect(resetDataContext).toHaveBeenCalledTimes(1);

    // The reload recreates the store; its first config hydration restores the error.
    useElectronStore.setState({
      dataSyncConfig: { storageMode: 'cloud' },
      isInitRemoteServerConfig: false,
      remoteServerSyncError: undefined,
    });
    answerConfig(LEFT_A);

    expect(useElectronStore.getState().remoteServerSyncError).toEqual({
      message: 'denied by user',
      type: 'AUTH_ERROR',
    });
  });

  it('resets after disconnecting from the server', async () => {
    await useElectronStore.getState().disconnectRemoteServer();

    expect(remoteServerService.clearRemoteServerConfig).toHaveBeenCalled();
    expect(resetDataContext).toHaveBeenCalledTimes(1);
  });
});
