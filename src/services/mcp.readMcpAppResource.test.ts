import { deserializeMcpIpcPayload, serializeMcpIpcPayload } from '@lobechat/utils/mcpIpcPayload';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mcpService } from './mcp';

const { ipcRead, relayRead, plugins } = vi.hoisted(() => ({
  ipcRead: vi.fn(),
  plugins: new Map<string, unknown>(),
  relayRead: vi.fn(),
}));

vi.mock('@lobechat/const', async (importOriginal) => ({
  ...((await importOriginal()) as Record<string, unknown>),
  isDesktop: true,
}));

vi.mock('@/libs/trpc/client', () => ({
  toolsClient: { mcp: { readUiResource: { query: relayRead } } },
}));

vi.mock('@/utils/electron/ipc', () => ({
  ensureElectronIpc: () => ({ mcp: { readUiResource: ipcRead } }),
}));

vi.mock('@/store/tool/store', () => ({ getToolStoreState: () => ({}) }));

vi.mock('@/store/tool/selectors', () => ({
  pluginSelectors: {
    getCustomPluginById: () => () => undefined,
    getInstalledPluginById: (id: string) => () => plugins.get(id),
  },
}));

vi.mock('@/store/tool/slices/connector', () => ({
  connectorSelectors: { connectorByIdentifier: () => () => undefined },
}));

const view = { contents: [{ text: '<html />', uri: 'ui://app' }] };
const httpPlugin = (url: string) => ({
  customParams: { mcp: { headers: { 'x-key': 'k' }, type: 'http', url } },
});

describe('mcpService.readMcpAppResource on desktop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    plugins.clear();
    ipcRead.mockResolvedValue(serializeMcpIpcPayload(view));
    relayRead.mockResolvedValue(view);
  });

  it('reads views of localhost / LAN http servers over IPC, not the server relay', async () => {
    plugins.set('local', httpPlugin('http://127.0.0.1:3000/mcp'));

    await expect(mcpService.readMcpAppResource('local', 'ui://app')).resolves.toEqual(view);

    expect(relayRead).not.toHaveBeenCalled();
    expect(deserializeMcpIpcPayload(ipcRead.mock.calls[0][0])).toEqual({
      http: {
        headers: { 'x-key': 'k' },
        name: 'local',
        url: 'http://127.0.0.1:3000/mcp',
      },
      uri: 'ui://app',
    });
  });

  it('keeps public http servers on the server relay', async () => {
    plugins.set('remote', httpPlugin('https://mcp.example.com/mcp'));

    await expect(mcpService.readMcpAppResource('remote', 'ui://app')).resolves.toEqual(view);

    expect(ipcRead).not.toHaveBeenCalled();
    expect(relayRead).toHaveBeenCalledWith(expect.objectContaining({ uri: 'ui://app' }));
  });
});
