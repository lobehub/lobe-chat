import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useClaudeCodeMemory } from './useClaudeCodeMemory';

const mocks = vi.hoisted(() => ({
  isDesktop: true,
  listMemory: vi.fn(),
}));

vi.mock('@lobechat/const', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  get isDesktop() {
    return mocks.isDesktop;
  },
}));
vi.mock('@/services/claudeCodeMemory', () => ({
  claudeCodeMemoryService: { listMemory: mocks.listMemory },
}));
vi.mock('@/business/client/hooks/useActiveWorkspaceId', () => ({
  useActiveWorkspaceId: () => undefined,
}));

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(SWRConfig, { value: { provider: () => new Map() } }, children);

const memoryDir = '/home/me/.claude/projects/-repo/memory';

describe('useClaudeCodeMemory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isDesktop = true;
  });

  it('reads the project memory over the local desktop transport', async () => {
    mocks.listMemory.mockResolvedValue({ files: [], memoryDir });

    const { result } = renderHook(() => useClaudeCodeMemory(undefined, '/repo'), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual({ files: [], memoryDir }));
    expect(mocks.listMemory).toHaveBeenCalledWith({
      deviceId: undefined,
      workingDirectory: '/repo',
    });
  });

  it('stays inert without a project folder, or on web without a bound device', () => {
    renderHook(() => useClaudeCodeMemory(undefined, undefined), { wrapper });
    mocks.isDesktop = false;
    renderHook(() => useClaudeCodeMemory(undefined, '/repo'), { wrapper });

    expect(mocks.listMemory).not.toHaveBeenCalled();
  });

  it('reports an offline device as an error, not as an empty memory', async () => {
    mocks.listMemory.mockResolvedValue(null);

    const { result } = renderHook(() => useClaudeCodeMemory('device-1', '/repo'), { wrapper });

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
    expect(result.current.data).toBeUndefined();
    expect(mocks.listMemory).toHaveBeenCalledWith({
      deviceId: 'device-1',
      workingDirectory: '/repo',
    });
  });
});
