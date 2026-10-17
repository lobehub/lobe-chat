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
  listManifests: vi.fn().mockResolvedValue({ tools: [] }),
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
    stale.callTool.mockRejectedValue(
      Object.assign(new Error('Connection closed'), { code: -32000 }),
    );
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
      failing.callTool.mockRejectedValue(
        Object.assign(new Error('Connection closed'), { code: -32000 }),
      );
      return failing;
    });

    await expect(
      ctr.runStdioMcpTool({
        args: '',
        env: undefined,
        params: { args: ['--stdio'], command: 'ida-mcp', name: 'ida-mcp' },
        toolName: 'execute_python',
      } as any),
    ).rejects.toThrow('Connection closed');
  });

  it('does NOT retry when the tool itself failed at app level (no double-apply of side effects)', async () => {
    const pooled = makeClientInstance('pooled');
    pooled.callTool.mockRejectedValue(
      new Error('no open database instance; call open_database() first'),
    );
    mcpClientMocks.mockReturnValue(pooled);

    await expect(
      ctr.runStdioMcpTool({
        args: '',
        env: undefined,
        params: { args: ['--stdio'], command: 'ida-mcp', name: 'ida-mcp' },
        toolName: 'execute_python',
      } as any),
    ).rejects.toThrow('no open database instance');

    // App-level failure: no eviction, no disconnect, no second invocation.
    expect(pooled.callTool).toHaveBeenCalledTimes(1);
    expect(pooled.disconnect).not.toHaveBeenCalled();
    expect(mcpClientMocks).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry when post-processing (media upload) fails after a successful tool run', async () => {
    const pooled = makeClientInstance('pooled');
    // Return an image block so processContentBlocks runs the media upload.
    pooled.callTool.mockResolvedValue({
      content: [{ data: 'aW1hZ2U=', mimeType: 'image/png', type: 'image' }],
      isError: false,
    });
    mcpClientMocks.mockReturnValue(pooled);
    // Simulate media upload failure inside processContentBlocks.
    (ctr as any).app.getService = vi.fn(() => ({
      getFileHTTPURL: vi.fn(),
      uploadFile: vi.fn().mockRejectedValue(new Error('upload unavailable')),
    }));

    await expect(
      ctr.runStdioMcpTool({
        args: '',
        env: undefined,
        params: { args: ['--stdio'], command: 'ida-mcp', name: 'ida-mcp' },
        toolName: 'render_screenshot',
      } as any),
    ).rejects.toThrow('upload unavailable');

    // The tool ran exactly once — its side effect must not be re-applied.
    expect(pooled.callTool).toHaveBeenCalledTimes(1);
    expect(pooled.disconnect).not.toHaveBeenCalled();
  });

  it('preserves CLI argument order in pool keys (reordered argv must not share a session)', async () => {
    mcpClientMocks.mockImplementation(() => makeClientInstance('x'));

    await ctr.runStdioMcpTool({
      args: '',
      env: undefined,
      params: { args: ['--port', '8080', 'serve'], command: 'svc', name: 'svc' },
      toolName: 'ping',
    } as any);
    await ctr.runStdioMcpTool({
      args: '',
      env: undefined,
      params: { args: ['serve', '--port', '8080'], command: 'svc', name: 'svc' },
      toolName: 'ping',
    } as any);

    // Same tokens, different order → distinct sessions, never reused.
    expect(mcpClientMocks).toHaveBeenCalledTimes(2);
  });

  it('evicts the pooled client when listManifests fails on a stale session', async () => {
    const seeded = makeClientInstance('seeded');
    seeded.listManifests.mockRejectedValue(new Error('Connection closed'));
    mcpClientMocks.mockReturnValue(seeded);

    await expect(
      ctr.getStdioMcpServerManifest({
        args: ['--stdio'],
        command: 'ida-mcp',
        name: 'ida-mcp',
      } as any),
    ).rejects.toThrow('Connection closed');

    // Broken session evicted + disconnected, so the next refresh starts fresh.
    expect(seeded.disconnect).toHaveBeenCalledTimes(1);
  });
});
