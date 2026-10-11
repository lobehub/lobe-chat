import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DisplayPreferenceMemory } from '@/database/repositories/userMemory';
import type * as SwrLib from '@/libs/swr';
import { mutate } from '@/libs/swr';
import { userMemoryKeys } from '@/libs/swr/keys';
import { memoryCRUDService } from '@/services/userMemory';
import { useUserMemoryStore } from '@/store/userMemory';
import { initialState } from '@/store/userMemory/initialState';
import { LayersEnum } from '@/types/userMemory';

vi.mock('@/libs/swr', async (importOriginal) => {
  const actual = await importOriginal<typeof SwrLib>();

  return {
    ...actual,
    mutate: vi.fn().mockResolvedValue(undefined),
  };
});

const preferenceMemory = {
  accessedAt: new Date('2026-05-27T00:00:00.000Z'),
  capturedAt: new Date('2026-05-27T00:00:00.000Z'),
  conclusionDirectives: 'Prefer concise answers.',
  createdAt: new Date('2026-05-27T00:00:00.000Z'),
  id: 'preference-1',
  metadata: null,
  scorePriority: 0,
  suggestions: null,
  tags: [],
  title: 'Preference',
  type: null,
  updatedAt: new Date('2026-05-27T00:00:00.000Z'),
  userId: 'user-1',
  userMemoryId: 'memory-1',
} satisfies DisplayPreferenceMemory;

beforeEach(() => {
  vi.clearAllMocks();

  const page = {
    currentPage: 0,
    hasMore: false,
    items: [preferenceMemory],
    pageSize: 12,
    total: 1,
  };
  useUserMemoryStore.setState(
    {
      ...initialState,
      preferenceListData: page,
      preferenceListEntries: { [initialState.preferenceListKey]: page },
      preferences: [preferenceMemory],
      preferencesInit: true,
      preferencesPage: 1,
      preferencesTotal: 1,
    },
    false,
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('userMemory base actions', () => {
  describe('updateMemory', () => {
    it('updates a preference memory in place and revalidates related caches', async () => {
      const updatePreferenceResult = {} as Awaited<
        ReturnType<typeof memoryCRUDService.updatePreference>
      >;
      vi.spyOn(memoryCRUDService, 'updatePreference').mockResolvedValue(updatePreferenceResult);

      const { result } = renderHook(() => useUserMemoryStore());

      await act(async () => {
        await result.current.updateMemory(
          'preference-1',
          'Prefer concise answers with examples.',
          LayersEnum.Preference,
        );
      });

      const edited = {
        ...preferenceMemory,
        conclusionDirectives: 'Prefer concise answers with examples.',
      };
      expect(result.current.preferences).toEqual([edited]);
      // The canonical replica value carries the edit, not only the flat mirror.
      expect(result.current.preferenceListEntries[result.current.preferenceListKey].items).toEqual([
        edited,
      ]);
      expect(memoryCRUDService.updatePreference).toHaveBeenCalledWith('preference-1', {
        conclusionDirectives: 'Prefer concise answers with examples.',
      });
      expect(mutate).toHaveBeenCalledWith(expect.any(Function));
      expect(mutate).toHaveBeenCalledWith(
        userMemoryKeys.memoryDetail(LayersEnum.Preference, 'preference-1'),
      );
    });

    it('applies an identity edit through the replica and revalidates it', async () => {
      vi.spyOn(memoryCRUDService, 'updateIdentity').mockResolvedValue(true);
      const internal_updateIdentityEntity = vi.fn();
      const internal_clearIdentityList = vi.fn().mockResolvedValue(true);
      const refreshIdentities = vi.fn().mockResolvedValue(undefined);
      useUserMemoryStore.setState({
        internal_clearIdentityList,
        internal_updateIdentityEntity,
        refreshIdentities,
      });

      await act(async () => {
        await useUserMemoryStore
          .getState()
          .updateMemory('identity-1', 'New description', LayersEnum.Identity);
      });

      expect(internal_updateIdentityEntity).toHaveBeenCalledWith(
        'identity-1',
        expect.any(Function),
      );
      const patch = internal_updateIdentityEntity.mock.calls[0][1];
      expect(patch({ description: 'old', id: 'identity-1' })).toEqual({
        description: 'New description',
        id: 'identity-1',
      });
      expect(refreshIdentities).toHaveBeenCalledTimes(1);
      expect(internal_clearIdentityList).not.toHaveBeenCalled();
    });
  });

  describe('purgeAllMemories', () => {
    it('clears the identity replicas right after deleting, then revalidates them', async () => {
      const order: string[] = [];
      vi.spyOn(memoryCRUDService, 'deleteAll').mockImplementation(async () => {
        order.push('deleteAll');
        return undefined as never;
      });
      const internal_clearIdentityList = vi.fn(async () => {
        order.push('clearIdentityList');
        return true;
      });
      const refreshIdentities = vi.fn(async () => {
        order.push('refreshIdentities');
      });
      useUserMemoryStore.setState({ internal_clearIdentityList, refreshIdentities });

      await act(async () => {
        await useUserMemoryStore.getState().purgeAllMemories();
      });

      expect(order).toEqual(['deleteAll', 'clearIdentityList', 'refreshIdentities']);
    });
  });
});

describe('purgeAllMemories', () => {
  it('clears the preference replica through the engine right after deleting', async () => {
    const order: string[] = [];
    vi.spyOn(memoryCRUDService, 'deleteAll').mockImplementation(async () => {
      order.push('deleteAll');
      return undefined as never;
    });
    const internal_clearPreferenceList = vi.fn(async () => {
      order.push('clearPreferenceList');
      return true;
    });
    useUserMemoryStore.setState({ internal_clearPreferenceList });
    vi.mocked(mutate).mockImplementation(async () => {
      order.push('revalidate');
    });

    await useUserMemoryStore.getState().purgeAllMemories();

    expect(internal_clearPreferenceList).toHaveBeenCalledTimes(1);
    expect(order.slice(0, 3)).toEqual(['deleteAll', 'clearPreferenceList', 'revalidate']);
    // The replica-owned fields are not overwritten by `preferenceInitialState`.
    expect(useUserMemoryStore.getState().preferences).toEqual([preferenceMemory]);
  });
});

describe('deletePersona', () => {
  const persona = { content: 'My persona', summary: 'Summary' };

  beforeEach(() => {
    useUserMemoryStore.setState({ persona, personaData: { persona }, personaInit: true });
    vi.mocked(mutate).mockResolvedValue(undefined as never);
  });

  it('clears the persona replica view while retaining the memory lists', async () => {
    vi.spyOn(memoryCRUDService, 'deletePersona').mockResolvedValue({ success: true });
    await useUserMemoryStore.getState().deletePersona();
    expect(useUserMemoryStore.getState().persona).toBeUndefined();
    // The canonical replica view carries the server-confirmed absence.
    expect(useUserMemoryStore.getState().personaData).toEqual({ persona: null });
    expect(useUserMemoryStore.getState().personaInit).toBe(true);
    expect(useUserMemoryStore.getState().preferences).toEqual([preferenceMemory]);
    expect(useUserMemoryStore.getState().preferencesTotal).toBe(1);
    // The replica adopts the userMemory:persona key as its sync key.
    expect(mutate).toHaveBeenCalledWith(userMemoryKeys.persona());
  });

  it('resolves when the persona is deleted but the follow-up read fails', async () => {
    vi.spyOn(memoryCRUDService, 'deletePersona').mockResolvedValue({ success: true });
    vi.mocked(mutate).mockRejectedValueOnce(new Error('read failed'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(useUserMemoryStore.getState().deletePersona()).resolves.toBeUndefined();

    expect(useUserMemoryStore.getState().persona).toBeUndefined();
    expect(useUserMemoryStore.getState().personaData).toEqual({ persona: null });
    expect(consoleError).toHaveBeenCalled();
  });

  it('retains the persona and memories when deletion fails', async () => {
    vi.spyOn(memoryCRUDService, 'deletePersona').mockRejectedValue(new Error('offline'));
    await expect(useUserMemoryStore.getState().deletePersona()).rejects.toThrow('offline');
    expect(useUserMemoryStore.getState().persona).toEqual(persona);
    expect(useUserMemoryStore.getState().preferences).toEqual([preferenceMemory]);
  });
});
