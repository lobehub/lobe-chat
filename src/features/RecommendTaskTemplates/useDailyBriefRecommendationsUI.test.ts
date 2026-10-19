/**
 * @vitest-environment happy-dom
 */
import { randomUUID } from 'node:crypto';

import type { TaskTemplate } from '@lobechat/const';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { createElement } from 'react';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cacheScope } from '@/libs/replica';
import { CACHE_TIERS } from '@/libs/swr/localStorageProvider';
import { taskTemplateService } from '@/services/taskTemplate';

import { dailyRecommendKey, dailyRecommendResource } from './projection';
import {
  initialTaskTemplateRecommendationState,
  useTaskTemplateRecommendationStore,
} from './recommendationStore';
import {
  resolveDailyBriefRecommendationDisplayMode,
  resolveDailyBriefRecommendationRequest,
  useDailyBriefRecommendationsUI,
} from './useDailyBriefRecommendationsUI';

const {
  mockRefreshSeed,
  mockSetRefreshSeed,
  mockUseFetchBriefs,
  mockUseFetchLobehubConnectorConnections,
  mockUseFetchUserComposioConnections,
  mockUseResolvedInterestKeys,
} = vi.hoisted(() => ({
  mockRefreshSeed: { value: '' },
  mockSetRefreshSeed: vi.fn(),
  mockUseFetchBriefs: vi.fn(),
  mockUseFetchLobehubConnectorConnections: vi.fn(),
  mockUseFetchUserComposioConnections: vi.fn(),
  mockUseResolvedInterestKeys: vi.fn(),
}));

vi.mock('ahooks', () => ({
  useSessionStorageState: () => [mockRefreshSeed.value, mockSetRefreshSeed],
}));

vi.mock('antd', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  App: {
    useApp: () => ({ message: { error: vi.fn() } }),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en-US', resolvedLanguage: 'en-US' },
    t: (key: string) => key,
  }),
}));

// The brief feed is a replica now: the hook only needs the feed to hold a
// value for the scope (`briefListMap` has an entry) to leave its skeleton —
// see `briefListSelectors.isBriefsInit`.
vi.mock('@/store/brief', () => ({
  useBriefStore: (selector: (state: any) => unknown) =>
    selector({
      briefListMap: { unresolved: [] },
      useFetchBriefs: mockUseFetchBriefs,
    }),
}));

vi.mock('@/store/tool', () => ({
  useToolStore: (selector: (state: any) => unknown) =>
    selector({
      useFetchLobehubSkillConnections: mockUseFetchLobehubConnectorConnections,
      useFetchUserComposioConnections: mockUseFetchUserComposioConnections,
    }),
}));

vi.mock('@/store/user', () => ({
  useUserStore: (selector: (state: any) => unknown) =>
    selector({
      isLoaded: true,
      isSignedIn: true,
      user: { interests: ['coding'] },
    }),
}));

vi.mock('@/services/taskTemplate', () => ({
  taskTemplateService: {
    dismiss: vi.fn(),
    listDailyRecommend: vi.fn(),
    recordCreated: vi.fn(),
  },
}));

vi.mock('./useResolvedInterestKeys', () => ({
  useResolvedInterestKeys: mockUseResolvedInterestKeys,
}));

const template = {
  category: 'engineering',
  connectors: [],
  cronPattern: '0 9 * * *',
  description: 'Description',
  id: 101,
  identifier: 'daily-engineering',
  instruction: 'Instruction',
  interests: ['coding'],
  title: 'Title',
} satisfies TaskTemplate;

describe('resolveDailyBriefRecommendationRequest', () => {
  it('keeps the entry key available while interests are still initializing', () => {
    const loading = resolveDailyBriefRecommendationRequest({
      interestKeys: null,
      isLogin: true,
      locale: 'zh-CN',
      recommendationCount: 3,
      refreshSeed: '',
    });
    const ready = resolveDailyBriefRecommendationRequest({
      interestKeys: ['ai'],
      isLogin: true,
      locale: 'zh-CN',
      recommendationCount: 3,
      refreshSeed: '',
    });

    expect(dailyRecommendKey(loading.params!)).toEqual(dailyRecommendKey(ready.params!));
    expect(loading.shouldFetch).toBe(false);
    expect(ready.shouldFetch).toBe(true);
  });

  it('does not include interests in the persisted entry or the sync key', () => {
    vi.spyOn(cacheScope, 'get').mockReturnValue('user-1:personal');
    const ai = resolveDailyBriefRecommendationRequest({
      interestKeys: ['ai'],
      isLogin: true,
      locale: 'zh-CN',
      recommendationCount: 3,
      refreshSeed: 'seed',
    }).params!;
    const research = resolveDailyBriefRecommendationRequest({
      interestKeys: ['research'],
      isLogin: true,
      locale: 'zh-CN',
      recommendationCount: 3,
      refreshSeed: 'seed',
    }).params!;

    expect(dailyRecommendResource.storageKey(ai)).toEqual(
      dailyRecommendResource.storageKey(research),
    );
    expect(dailyRecommendResource.syncKey!(ai)).toEqual(dailyRecommendResource.syncKey!(research));
  });

  // The SWR tier persists every key whose serialized form contains a
  // CACHE_TIERS pattern; the replica must stay the only persisted copy.
  it('keeps the replica sync key out of the SWR persistence tiers', () => {
    vi.spyOn(cacheScope, 'get').mockReturnValue('user-1:personal');
    const serialized = JSON.stringify(
      dailyRecommendResource.syncKey!({
        count: 3,
        interestKeys: ['ai'],
        locale: 'zh-CN',
        refreshSeed: '',
      }),
    );

    expect(dailyRecommendResource.storage).toBeDefined();
    expect(dailyRecommendResource.namespace).toBe('replica:taskTemplateDailyRecommend:v2');
    expect(
      [...CACHE_TIERS.idb, ...CACHE_TIERS.local].filter((p) => serialized.includes(p)),
    ).toEqual([]);
  });

  it('keeps refresh seed, count, and locale in the entry key', () => {
    const key = (locale: string, recommendationCount: number, refreshSeed: string) =>
      dailyRecommendKey(
        resolveDailyBriefRecommendationRequest({
          interestKeys: [],
          isLogin: true,
          locale,
          recommendationCount,
          refreshSeed,
        }).params!,
      );

    expect(key('zh-CN', 3, 'seed-a')).not.toEqual(key('zh-CN', 3, 'seed-b'));
    expect(key('zh-CN', 3, 'seed-a')).not.toEqual(key('en-US', 3, 'seed-a'));
    expect(key('zh-CN', 3, 'seed-a')).not.toEqual(key('zh-CN', 6, 'seed-a'));
  });

  it('disables the read before login', () => {
    expect(
      resolveDailyBriefRecommendationRequest({
        interestKeys: [],
        isLogin: false,
        locale: 'zh-CN',
        recommendationCount: 3,
        refreshSeed: '',
      }),
    ).toEqual({ params: null, shouldFetch: false });
  });
});

describe('resolveDailyBriefRecommendationDisplayMode', () => {
  it('keeps cached cards visible while interests are still initializing', () => {
    expect(
      resolveDailyBriefRecommendationDisplayMode({
        canFetchRecommendations: false,
        hasRecommendationKey: true,
        hasTemplates: true,
        isInit: false,
        isLoading: false,
        isValidating: false,
        isWaitingForInterestsFetch: false,
      }),
    ).toBe('cards');
  });

  it('keeps skeleton visible while the first ready-interest fetch is pending', () => {
    expect(
      resolveDailyBriefRecommendationDisplayMode({
        canFetchRecommendations: true,
        hasRecommendationKey: true,
        hasTemplates: false,
        isInit: true,
        isLoading: false,
        isValidating: true,
        isWaitingForInterestsFetch: false,
      }),
    ).toBe('skeleton');
  });

  it('keeps skeleton visible before the first ready-interest fetch starts', () => {
    expect(
      resolveDailyBriefRecommendationDisplayMode({
        canFetchRecommendations: true,
        hasRecommendationKey: true,
        hasTemplates: false,
        isInit: true,
        isLoading: false,
        isValidating: false,
        isWaitingForInterestsFetch: true,
      }),
    ).toBe('skeleton');
  });

  it('hides an initialized empty recommendation result only when idle', () => {
    expect(
      resolveDailyBriefRecommendationDisplayMode({
        canFetchRecommendations: true,
        hasRecommendationKey: true,
        hasTemplates: false,
        isInit: true,
        isLoading: false,
        isValidating: false,
        isWaitingForInterestsFetch: false,
      }),
    ).toBe('hidden');
  });
});

/** A fresh SWR cache per render: what a page reload starts from. */
const wrapper = ({ children }: PropsWithChildren) =>
  createElement(SWRConfig, { value: { dedupingInterval: 0, provider: () => new Map() } }, children);

/** Never-resolving read: the first frame can only come from storage. */
const pending = () => new Promise<never>(() => {});

const params = (overrides: { count?: number; refreshSeed?: string } = {}) => ({
  count: overrides.count ?? 3,
  interestKeys: ['coding'],
  locale: 'en-US',
  refreshSeed: overrides.refreshSeed ?? '',
});

describe('useDailyBriefRecommendationsUI', () => {
  let scope = '';

  const seed = (data: unknown, overrides?: { count?: number; refreshSeed?: string }) =>
    dailyRecommendResource.storage!.set(
      { queryKey: dailyRecommendResource.storageKey(params(overrides)), scope },
      { data: data as TaskTemplate[], updatedAt: 1 },
    );

  beforeEach(() => {
    vi.clearAllMocks();
    scope = `task-template-user-${randomUUID()}:personal`;
    vi.spyOn(cacheScope, 'get').mockImplementation(() => scope);
    vi.spyOn(cacheScope, 'use').mockImplementation(() => scope);
    vi.spyOn(cacheScope, 'canPersist').mockReturnValue(true);
    act(() => useTaskTemplateRecommendationStore.setState(initialTaskTemplateRecommendationState));
    mockRefreshSeed.value = '';
    mockUseResolvedInterestKeys.mockReturnValue(['coding']);
    vi.mocked(taskTemplateService.listDailyRecommend).mockResolvedValue({
      data: [template],
      success: true,
    });
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns cards when recommendations are loaded and forwards locale/count inputs', async () => {
    const { result } = renderHook(() => useDailyBriefRecommendationsUI({ count: 2 }), {
      wrapper,
    });

    await waitFor(() => expect(result.current).toMatchObject({ mode: 'cards' }));
    expect(result.current).toMatchObject({ templates: [template] });
    expect(taskTemplateService.listDailyRecommend).toHaveBeenCalledWith(['coding'], {
      count: 2,
      locale: 'en-US',
      refreshSeed: undefined,
    });
  });

  // Regression: the recommendations were persisted by the SWR localStorage tier
  // (`taskTemplate:` in CACHE_TIERS). They are a localStorage replica now: a
  // reload paints the persisted cards before the network answers.
  it('paints persisted cards on reload while the request is still pending', async () => {
    await seed([template]);
    vi.mocked(taskTemplateService.listDailyRecommend).mockImplementation(pending);

    const { result } = renderHook(() => useDailyBriefRecommendationsUI(), { wrapper });

    await waitFor(() => expect(result.current).toMatchObject({ mode: 'cards' }));
    expect(result.current).toMatchObject({ isValidating: true, templates: [template] });
    expect(taskTemplateService.listDailyRecommend).toHaveBeenCalledTimes(1);
  });

  it('paints persisted cards before interests resolve, then refreshes once they do', async () => {
    await seed([template]);
    mockUseResolvedInterestKeys.mockReturnValue(null);
    const fresh = { ...template, id: 202, title: 'Fresh' };
    vi.mocked(taskTemplateService.listDailyRecommend).mockResolvedValue({
      data: [fresh],
      success: true,
    });

    const { rerender, result } = renderHook(() => useDailyBriefRecommendationsUI(), { wrapper });

    await waitFor(() => expect(result.current).toMatchObject({ mode: 'cards' }));
    expect(result.current).toMatchObject({ templates: [template] });
    expect(taskTemplateService.listDailyRecommend).not.toHaveBeenCalled();

    mockUseResolvedInterestKeys.mockReturnValue(['coding']);
    rerender();

    await waitFor(() => expect(result.current).toMatchObject({ templates: [fresh] }));
    expect(taskTemplateService.listDailyRecommend).toHaveBeenCalledTimes(1);
  });

  it('shows the skeleton while nothing is persisted and the first read is pending', async () => {
    vi.mocked(taskTemplateService.listDailyRecommend).mockImplementation(pending);

    const { result } = renderHook(() => useDailyBriefRecommendationsUI(), { wrapper });

    await waitFor(() => expect(taskTemplateService.listDailyRecommend).toHaveBeenCalledTimes(1));
    expect(result.current).toEqual({ mode: 'skeleton', skeletonCount: 3 });
  });

  it('persists the fetched cards for the next session', async () => {
    const { result } = renderHook(() => useDailyBriefRecommendationsUI(), { wrapper });
    await waitFor(() => expect(result.current).toMatchObject({ mode: 'cards' }));

    await waitFor(async () => {
      const row = await dailyRecommendResource.storage!.get({
        queryKey: dailyRecommendResource.storageKey(params()),
        scope,
      });
      expect(row?.data).toEqual([template]);
    });
  });

  it('never paints another identity’s persisted cards', async () => {
    await dailyRecommendResource.storage!.set(
      { queryKey: dailyRecommendResource.storageKey(params()), scope: 'someone-else:personal' },
      { data: [{ ...template, title: 'Other user' }], updatedAt: 1 },
    );
    vi.mocked(taskTemplateService.listDailyRecommend).mockImplementation(pending);

    const { result } = renderHook(() => useDailyBriefRecommendationsUI(), { wrapper });

    await waitFor(() => expect(taskTemplateService.listDailyRecommend).toHaveBeenCalledTimes(1));
    expect(result.current).toEqual({ mode: 'skeleton', skeletonCount: 3 });
  });

  it('keeps the previous cards on screen while a refresh seed loads', async () => {
    const { rerender, result } = renderHook(() => useDailyBriefRecommendationsUI(), { wrapper });
    await waitFor(() => expect(result.current).toMatchObject({ mode: 'cards' }));

    vi.mocked(taskTemplateService.listDailyRecommend).mockImplementation(pending);
    mockRefreshSeed.value = 'next-seed';
    rerender();

    await waitFor(() =>
      expect(taskTemplateService.listDailyRecommend).toHaveBeenLastCalledWith(['coding'], {
        count: 3,
        locale: 'en-US',
        refreshSeed: 'next-seed',
      }),
    );
    expect(result.current).toMatchObject({ mode: 'cards', templates: [template] });
  });

  it('removes a created card and persists the shorter list', async () => {
    const { result } = renderHook(() => useDailyBriefRecommendationsUI(), { wrapper });
    await waitFor(() => expect(result.current).toMatchObject({ mode: 'cards' }));
    if (result.current.mode !== 'cards') return;

    const { onCreated } = result.current;
    act(() => onCreated(template.id));

    expect(result.current).toEqual({ mode: 'hidden' });
    await waitFor(async () => {
      const row = await dailyRecommendResource.storage!.get({
        queryKey: dailyRecommendResource.storageKey(params()),
        scope,
      });
      expect(row?.data).toEqual([]);
    });
  });

  it('rolls a dismissed card back when the server refuses', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    let reject!: (error: unknown) => void;
    vi.mocked(taskTemplateService.dismiss).mockImplementation(
      () => new Promise((_, rejectPromise) => (reject = rejectPromise)),
    );

    const { result } = renderHook(() => useDailyBriefRecommendationsUI(), { wrapper });
    await waitFor(() => expect(result.current).toMatchObject({ mode: 'cards' }));
    if (result.current.mode !== 'cards') return;

    let dismissing: Promise<void> | undefined;
    const { onDismiss } = result.current;
    act(() => {
      dismissing = onDismiss(template.id) as unknown as Promise<void>;
    });
    expect(result.current).toEqual({ mode: 'hidden' });

    await act(async () => {
      reject(new Error('dismiss failed'));
      await dismissing;
    });

    expect(result.current).toMatchObject({ mode: 'cards', templates: [template] });
    expect(consoleErrorSpy).toHaveBeenCalledWith('[taskTemplate:dismiss]', expect.any(Error));
  });

  it('drops persisted rows the cards cannot render', async () => {
    await seed([
      template,
      null,
      { ...template, connectors: [null], id: 103 },
      {
        ...template,
        connectors: [{ identifier: 'nonexistent-x', required: true, source: 'lobehub' }],
        id: 104,
      },
      { category: 'engineering', cronPattern: '0 9 * * *', id: 'oss-intel-daily', interests: [] },
    ]);
    vi.mocked(taskTemplateService.listDailyRecommend).mockImplementation(pending);

    const { result } = renderHook(() => useDailyBriefRecommendationsUI(), { wrapper });

    await waitFor(() => expect(result.current).toMatchObject({ mode: 'cards' }));
    expect(result.current).toMatchObject({ templates: [template] });
  });

  it('treats a non-array response as empty', async () => {
    vi.mocked(taskTemplateService.listDailyRecommend).mockResolvedValue({
      data: { ...template },
      success: true,
    } as any);

    const { result } = renderHook(() => useDailyBriefRecommendationsUI(), { wrapper });

    await waitFor(() => expect(taskTemplateService.listDailyRecommend).toHaveBeenCalled());
    await waitFor(() => expect(result.current).toEqual({ mode: 'hidden' }));
    expect(mockUseFetchUserComposioConnections).toHaveBeenCalledWith(false);
    expect(mockUseFetchLobehubConnectorConnections).toHaveBeenCalledWith(false);
  });

  it('logs a failed first load and hides instead of rendering an empty state', async () => {
    const error = new Error('market down');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(taskTemplateService.listDailyRecommend).mockRejectedValue(error);

    const { result } = renderHook(() => useDailyBriefRecommendationsUI(), { wrapper });

    await waitFor(() =>
      expect(consoleErrorSpy).toHaveBeenCalledWith('[taskTemplate:listDailyRecommend]', error),
    );
    expect(result.current).toEqual({ mode: 'hidden' });
  });

  it('keeps persisted cards when the background refresh fails', async () => {
    await seed([template]);
    const error = new Error('market down');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(taskTemplateService.listDailyRecommend).mockRejectedValue(error);

    const { result } = renderHook(() => useDailyBriefRecommendationsUI(), { wrapper });

    await waitFor(() =>
      expect(consoleErrorSpy).toHaveBeenCalledWith('[taskTemplate:listDailyRecommend]', error),
    );
    expect(result.current).toMatchObject({ mode: 'cards', templates: [template] });
  });
});
