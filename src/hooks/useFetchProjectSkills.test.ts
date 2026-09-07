import { act, renderHook, type RenderHookResult, waitFor } from '@testing-library/react';
import { createElement, type PropsWithChildren, Suspense } from 'react';
import { SWRConfig } from 'swr';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { projectSkillService } from '@/services/projectSkill';

import { useFetchProjectSkills } from './useFetchProjectSkills';

vi.mock('@/business/client/hooks/useActiveWorkspaceId', () => ({
  useActiveWorkspaceId: () => undefined,
}));

vi.mock('@/services/projectSkill', () => ({
  projectSkillService: { listProjectSkills: vi.fn() },
}));

const wrapper = ({ children }: PropsWithChildren) =>
  createElement(
    SWRConfig,
    { value: { provider: () => new Map(), suspense: true } },
    createElement(Suspense, { fallback: 'Loading' }, children),
  );

const renderSkills = async (...args: Parameters<typeof useFetchProjectSkills>) => {
  let rendered!: RenderHookResult<ReturnType<typeof useFetchProjectSkills>, unknown>;
  await act(async () => {
    rendered = renderHook(() => useFetchProjectSkills(...args), { wrapper });
  });
  return rendered;
};

describe('useFetchProjectSkills', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('settles an unavailable device response instead of suspending again on rerender', async () => {
    vi.mocked(projectSkillService.listProjectSkills).mockResolvedValue(undefined);
    const { result, rerender } = await renderSkills('/project', 'offline-device');

    await waitFor(() => {
      expect(result.current?.data).toBeNull();
      expect(result.current.isValidating).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
    const settledCalls = vi.mocked(projectSkillService.listProjectSkills).mock.calls.length;
    await act(async () => rerender());
    expect(result.current.data).toBeNull();
    expect(projectSkillService.listProjectSkills).toHaveBeenCalledTimes(settledCalls);
    expect(projectSkillService.listProjectSkills).toHaveBeenCalledWith({
      deviceId: 'offline-device',
      scope: '/project',
    });
  });

  it('can recover from an unavailable device when revalidated', async () => {
    const available = { root: '/project', skills: [], source: null };
    vi.mocked(projectSkillService.listProjectSkills).mockResolvedValue(undefined);
    const { result } = await renderSkills('/project', 'device');
    await waitFor(() => expect(result.current?.data).toBeNull());

    vi.mocked(projectSkillService.listProjectSkills).mockResolvedValue(available);
    await act(async () => {
      await result.current.mutate();
    });
    expect(result.current.data).toEqual(available);
  });

  it('does not scan without a working directory', async () => {
    const { result } = await renderSkills(undefined, 'device');
    expect(result.current.data).toBeUndefined();
    expect(projectSkillService.listProjectSkills).not.toHaveBeenCalled();
  });
});
