import { deserializeMcpIpcPayload, serializeMcpIpcPayload } from '@lobechat/utils/mcpIpcPayload';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mcpService } from './mcp';

const {
  connectorCall,
  connectorRead,
  connectors,
  ipcCall,
  ipcRead,
  relayCall,
  relayRead,
  plugins,
} = vi.hoisted(() => ({
  connectorCall: vi.fn(),
  connectorRead: vi.fn(),
  connectors: new Map<string, unknown>(),
  ipcCall: vi.fn(),
  ipcRead: vi.fn(),
  plugins: new Map<string, unknown>(),
  relayCall: vi.fn(),
  relayRead: vi.fn(),
}));

vi.mock('@lobechat/const', async (importOriginal) => ({
  ...((await importOriginal()) as Record<string, unknown>),
  isDesktop: true,
}));

vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: {
    connector: { callTool: { mutate: connectorCall }, readUiResource: { query: connectorRead } },
  },
  toolsClient: { mcp: { callTool: { mutate: relayCall }, readUiResource: { query: relayRead } } },
}));

vi.mock('@/utils/electron/ipc', () => ({
  ensureElectronIpc: () => ({ mcp: { callTool: ipcCall, readUiResource: ipcRead } }),
}));

vi.mock('./discover', () => ({
  discoverService: {
    reportPluginCall: vi.fn().mockResolvedValue(undefined),
    safeInjectMPToken: vi.fn(),
  },
}));

vi.mock('@/store/tool/store', () => ({ getToolStoreState: () => ({}) }));

vi.mock('@/store/tool/selectors', () => ({
  pluginSelectors: {
    getCustomPluginById: () => () => undefined,
    getInstalledPluginById: (id: string) => () => plugins.get(id),
  },
}));

vi.mock('@/store/tool/slices/connector', () => ({
  connectorSelectors: {
    connectorByIdentifierForAgent: (id: string, agentId?: string) => () =>
      connectors.get(`${agentId}:${id}`),
  },
}));

const view = { contents: [{ text: '<html />', uri: 'ui://app' }] };
const httpPlugin = (url: string) => ({
  customParams: { mcp: { headers: { 'x-key': 'k' }, type: 'http', url } },
});

describe('mcpService.readMcpAppResource on desktop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    plugins.clear();
    connectors.clear();
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

describe('mcpService MCP App calls for agents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    plugins.clear();
    connectors.clear();
    connectorRead.mockResolvedValue(view);
    connectorCall.mockResolvedValue({ content: 'ok', success: true });
  });

  it('lets the server resolve a connector only the agent owns', async () => {
    await expect(mcpService.readMcpAppResource('agent-app', 'ui://app', 'agt_1')).resolves.toEqual(
      view,
    );

    expect(connectorRead).toHaveBeenCalledWith({
      agentId: 'agt_1',
      identifier: 'agent-app',
      uri: 'ui://app',
    });
  });

  it('sends the agent with connector tool calls', async () => {
    connectors.set('agt_1:linear', {
      isEnabled: true,
      mcpServerUrl: 'https://mcp.linear.app/mcp',
    });

    await mcpService.invokeMcpToolCall(
      { apiName: 'list', arguments: '{}', id: 't1', identifier: 'linear', type: 'mcp' },
      { agentId: 'agt_1' },
    );

    expect(connectorCall).toHaveBeenCalledWith(
      { agentId: 'agt_1', args: '{}', identifier: 'linear', toolName: 'list' },
      expect.anything(),
    );
  });
});

describe('mcpService.invokeMcpToolCall on desktop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    plugins.clear();
    connectors.clear();
    ipcCall.mockResolvedValue(serializeMcpIpcPayload({ content: 'ok', success: true }));
  });

  it('calls localhost / LAN http servers over IPC, not the server relay', async () => {
    plugins.set('local', httpPlugin('http://127.0.0.1:3000/mcp'));

    await mcpService.invokeMcpToolCall(
      {
        apiName: 'refresh',
        arguments: '{"city":"Paris"}',
        id: 't1',
        identifier: 'local',
        type: 'mcp',
      },
      {},
    );

    expect(relayCall).not.toHaveBeenCalled();
    expect(deserializeMcpIpcPayload(ipcCall.mock.calls[0][0])).toEqual({
      args: { city: 'Paris' },
      http: { headers: { 'x-key': 'k' }, name: 'local', url: 'http://127.0.0.1:3000/mcp' },
      toolName: 'refresh',
    });
  });
});
