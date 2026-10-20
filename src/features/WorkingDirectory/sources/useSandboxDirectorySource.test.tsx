import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { environmentService } from '@/services/environment';
import { sandboxStorageService } from '@/services/sandboxStorage';

import { useSandboxDirectorySource } from './useSandboxDirectorySource';

vi.mock('@/business/client/hooks/useActiveWorkspaceId', () => ({
  useActiveWorkspaceId: () => 'ws1',
}));

vi.mock('@/features/EnvironmentManager/useCanEditEnvironment', () => ({
  useCanEditEnvironment: () => () => true,
}));

vi.mock('@/services/sandboxStorage', () => ({
  sandboxStorageService: { listFiles: vi.fn(), listInstances: vi.fn() },
}));

vi.mock('@/services/environment', () => ({
  environmentService: { listEnvironments: vi.fn() },
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>{children}</SWRConfig>
);

const renderListing = (path?: string) =>
  renderHook(
    () =>
      useSandboxDirectorySource({
        drive: 'personal',
        isWorkspace: true,
        onPickInstance: vi.fn(),
      }).useListing(path),
    { wrapper },
  );

describe('useSandboxDirectorySource listing', () => {
  beforeEach(() => {
    vi.mocked(sandboxStorageService.listFiles)
      .mockReset()
      .mockResolvedValue({
        entries: [{ isDirectory: true, name: 'held', path: 'held' }],
      } as any);
    vi.mocked(sandboxStorageService.listInstances).mockReset();
    vi.mocked(environmentService.listEnvironments)
      .mockReset()
      .mockResolvedValue({ environments: [] } as any);
  });

  it('should fail the root listing when the environment directories cannot be read', async () => {
    // Without the instances a folder another conversation holds lists as a
    // plain folder that can be picked.
    const failure = new Error('instances unavailable');
    vi.mocked(sandboxStorageService.listInstances).mockRejectedValue(failure);

    const { result } = renderListing();

    await waitFor(() => expect(result.current.error).toBe(failure));
  });

  it('should retry the environment directories along with the folders', async () => {
    vi.mocked(sandboxStorageService.listInstances)
      .mockRejectedValueOnce(new Error('instances unavailable'))
      .mockResolvedValue({ instances: [] } as any);

    const { result } = renderListing();
    await waitFor(() => expect(result.current.error).toBeDefined());

    result.current.retry();

    await waitFor(() => expect(result.current.error).toBeUndefined());
    expect(sandboxStorageService.listInstances).toHaveBeenCalledTimes(2);
  });

  it('should not read the environment directories below the root', async () => {
    const { result } = renderListing('projects');

    await waitFor(() => expect(result.current.directory).toBeDefined());
    expect(result.current.error).toBeUndefined();
    expect(sandboxStorageService.listInstances).not.toHaveBeenCalled();
  });
});
