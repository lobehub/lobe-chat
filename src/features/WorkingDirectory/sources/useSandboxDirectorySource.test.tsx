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

const renderListing = (
  path?: string,
  options: { currentInstanceId?: string; onPickInstance?: () => void } = {},
) =>
  renderHook(
    () =>
      useSandboxDirectorySource({
        currentInstanceId: options.currentInstanceId,
        drive: 'personal',
        isWorkspace: true,
        onPickInstance: options.onPickInstance ?? vi.fn(),
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
    // The folders came back, but listing them would offer the held one as
    // a plain folder to browse into and use.
    expect(result.current.entries).toEqual([]);
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

  it('should fail the root listing when the environments cannot be read', async () => {
    // Without them a private environment's directory reads as public, and a
    // public agent could pick a folder it cannot run in.
    const failure = new Error('environments unavailable');
    vi.mocked(sandboxStorageService.listInstances).mockResolvedValue({ instances: [] } as any);
    vi.mocked(environmentService.listEnvironments).mockRejectedValue(failure);

    const { result } = renderListing();

    await waitFor(() => expect(result.current.error).toBe(failure));
  });

  it('should keep the root loading until the environments arrive', async () => {
    vi.mocked(sandboxStorageService.listInstances).mockResolvedValue({ instances: [] } as any);
    vi.mocked(environmentService.listEnvironments).mockReturnValue(new Promise(() => {}));

    const { result } = renderListing();

    await waitFor(() => expect(result.current.directory).toBeDefined());
    expect(result.current.isLoading).toBe(true);
  });

  describe('an environment directory still building', () => {
    const building = {
      environmentId: 'env-1',
      id: 'inst-1',
      inUse: true,
      inUseByThisTopic: false,
      name: 'held',
      rebuildRequired: false,
      status: 'pending',
      workingDirectory: 'held',
    };

    beforeEach(() => {
      vi.mocked(sandboxStorageService.listInstances).mockResolvedValue({
        instances: [building],
      } as any);
    });

    it("should not bind the conversation to another conversation's build", async () => {
      // The build holds the directory; a run started on it would race it.
      const onPickInstance = vi.fn();
      const { result } = renderListing(undefined, { onPickInstance });
      await waitFor(() => expect(result.current.entries[0]?.onActivate).toBeDefined());

      result.current.entries[0].onActivate!();

      expect(onPickInstance).not.toHaveBeenCalled();
      expect(result.current.entries[0].description).toBe('workingDirectory.drive.buildingDesc');
    });

    it("should keep the conversation's own building directory pickable", async () => {
      const onPickInstance = vi.fn();
      const { result } = renderListing(undefined, { currentInstanceId: 'inst-1', onPickInstance });
      await waitFor(() => expect(result.current.entries[0]?.onActivate).toBeDefined());

      result.current.entries[0].onActivate!();

      expect(onPickInstance).toHaveBeenCalledWith('inst-1', 'personal');
    });
  });

  it('should not read the environment directories below the root', async () => {
    const { result } = renderListing('projects');

    await waitFor(() => expect(result.current.directory).toBeDefined());
    expect(result.current.error).toBeUndefined();
    expect(sandboxStorageService.listInstances).not.toHaveBeenCalled();
  });
});
