import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { App } from '@/core/App';

import McpCtr from '../McpCtr';

const { mcpClientMocks } = vi.hoisted(() => ({
  mcpClientMocks: vi.fn(),
}));

// The controller lazily imports the MCP client module; mock the module so no
// real stdio process is ever spawned. The specifier must mirror the
// controller's own dynamic import (`../libs/mcp/client` relative to McpCtr.ts).
vi.mock('../../libs/mcp/client', () => ({
  MCPClient: class {
    constructor(public params: unknown) {
      return mcpClientMocks();
    }
  },
  MCPConnectionError: class extends Error {
    name = 'MCPConnectionError';
    stderrLogs: string[] = [];
  },
}));

const mockApp = {
  getService: vi.fn(() => null),
} as unknown as App;

const makeClientInstance = (label: string) => ({
  callTool: vi.fn().mockImplementation(async () => ({
    content: [{ text: `${label}-result`, type: 'text' }],
    isError: false,
  })),
  disconnect: vi.fn().mockResolvedValue(undefined),
  initialize: vi.fn().mockResolvedValue(undefined),
});

describe('McpCtr stdio session reuse (T-801 stateful MCP servers)', () => {
  let ctr: McpCtr;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    mcpClientMocks.mockReset();
    ctr = new McpCtr(mockApp);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reuses one stdio session across consecutive tool calls (state survives)', async () => {
    const instance = makeClientInstance('first');
    mcpClientMocks.mockReturnValue(instance);

    await ctr.runStdioMcpTool({
      args: '',
      env: undefined,
      params: { args: ['--stdio'], command: 'ida-mcp', name: 'ida-mcp' },
      toolName: 'open_database',
    } as any);
    await ctr.runStdioMcpTool({
      args: '',
      env: undefined,
      params: { args: ['--stdio'], command: 'ida-mcp', name: 'ida-mcp' },
      toolName: 'execute_python',
    } as any);

    // Exactly ONE MCPClient was constructed for both calls: the stdio
    // process is NOT respawned per call, so server-side state survives.
    expect(mcpClientMocks).toHaveBeenCalledTimes(1);
    expect(instance.callTool).toHaveBeenCalledTimes(2);
    // Pooled sessions are never disconnected between calls.
    expect(instance.disconnect).not.toHaveBeenCalled();
    // Second call actually ran (result produced).
    expect(instance.callTool).toHaveBeenLastCalledWith('execute_python', {});
  });

  it('spawns separate sessions for different connection params', async () => {
    const first = makeClientInstance('a');
    const second = makeClientInstance('b');
    mcpClientMocks.mockReturnValueOnce(first).mockReturnValueOnce(second);

    await ctr.runStdioMcpTool({
      args: '',
      env: undefined,
      params: { args: ['--stdio'], command: 'ida-mcp', name: 'ida-mcp' },
      toolName: 'open_database',
    } as any);
    await ctr.runStdioMcpTool({
      args: '',
      env: { IDB_PATH: '/other' },
      params: { args: ['--stdio'], command: 'ida-mcp', name: 'ida-mcp' },
      toolName: 'open_database',
    } as any);

    expect(mcpClientMocks).toHaveBeenCalledTimes(2);
  });

  it('retries on a fresh session after a stale pooled session fails, then keeps pooling', async () => {
    const stale = makeClientInstance('stale');
    stale.callTool.mockRejectedValue(new Error('no open database instance'));
    const fresh = makeClientInstance('fresh');
    mcpClientMocks.mockReturnValueOnce(stale).mockReturnValueOnce(fresh).mockReturnValue(fresh);

    const result = await ctr.runStdioMcpTool({
      args: '',
      env: undefined,
      params: { args: ['--stdio'], command: 'ida-mcp', name: 'ida-mcp' },
      toolName: 'execute_python',
    } as any);

    // The stale session was evicted + disconnected, the retry succeeded.
    expect(stale.disconnect).toHaveBeenCalledTimes(1);
    expect(fresh.callTool).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);

    // Next call reuses the replacement session (pool stays warm).
    await ctr.runStdioMcpTool({
      args: '',
      env: undefined,
      params: { args: ['--stdio'], command: 'ida-mcp', name: 'ida-mcp' },
      toolName: 'execute_python',
    } as any);
    expect(mcpClientMocks).toHaveBeenCalledTimes(2);
  });

  it('propagates the failure when the fresh retry also fails', async () => {
    mcpClientMocks.mockImplementation(() => {
      const failing = makeClientInstance('failing');
      failing.callTool.mockRejectedValue(new Error('server down'));
      return failing;
    });

    await expect(
      ctr.runStdioMcpTool({
        args: '',
        env: undefined,
        params: { args: ['--stdio'], command: 'ida-mcp', name: 'ida-mcp' },
        toolName: 'execute_python',
      } as any),
    ).rejects.toThrow('server down');
  });
});
