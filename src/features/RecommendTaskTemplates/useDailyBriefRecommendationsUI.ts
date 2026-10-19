import type { TaskTemplate, TaskTemplateConnectorSource } from '@lobechat/const';
import { TASK_TEMPLATE_RECOMMEND_COUNT } from '@lobechat/const';
import { createNanoId } from '@lobechat/utils';
import { toast } from '@lobehub/ui';
import { useSessionStorageState } from 'ahooks';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { taskTemplateService } from '@/services/taskTemplate';
import { useBriefStore } from '@/store/brief';
import { briefListSelectors } from '@/store/brief/selectors';
import { useToolStore } from '@/store/tool';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/slices/auth/selectors';

import {
  dailyRecommendKey,
  type DailyRecommendParams,
  normalizeTaskTemplateRecommendations,
} from './projection';
import { dailyRecommendReplica, useTaskTemplateRecommendationStore } from './recommendationStore';
import { useResolvedInterestKeys } from './useResolvedInterestKeys';

const REFRESH_SEED_STORAGE_KEY = 'lobehub:taskTemplate:refreshSeed';
const nextRefreshSeed = createNanoId(8);

export type DailyBriefRecommendationsUIState =
  | { mode: 'hidden' }
  | { mode: 'skeleton'; skeletonCount: number }
  | {
      isValidating: boolean;
      mode: 'cards';
      onCreated: (templateId: number) => void;
      onDismiss: (templateId: number) => void;
      onRefresh: () => void;
      templates: TaskTemplate[];
    };

interface UseDailyBriefRecommendationsUIOptions {
  count?: number;
}

interface ResolveDailyBriefRecommendationRequestParams {
  interestKeys: string[] | null;
  isLogin: boolean | undefined;
  locale: string;
  recommendationCount: number;
  refreshSeed?: string;
}

export const resolveDailyBriefRecommendationRequest = ({
  interestKeys,
  isLogin,
  locale,
  recommendationCount,
  refreshSeed,
}: ResolveDailyBriefRecommendationRequestParams) => {
  const enabled = isLogin === true;

  const params: DailyRecommendParams | null = enabled
    ? { count: recommendationCount, interestKeys, locale, refreshSeed: refreshSeed ?? '' }
    : null;

  return { params, shouldFetch: enabled && interestKeys !== null };
};

interface ResolveDailyBriefRecommendationDisplayModeParams {
  canFetchRecommendations: boolean;
  hasRecommendationKey: boolean;
  hasTemplates: boolean;
  isInit: boolean;
  isLoading: boolean;
  isValidating: boolean;
  isWaitingForInterestsFetch: boolean;
}

export const resolveDailyBriefRecommendationDisplayMode = ({
  canFetchRecommendations,
  hasRecommendationKey,
  hasTemplates,
  isInit,
  isLoading,
  isValidating,
  isWaitingForInterestsFetch,
}: ResolveDailyBriefRecommendationDisplayModeParams): DailyBriefRecommendationsUIState['mode'] => {
  if (!hasRecommendationKey) return 'hidden';
  if (hasTemplates) return 'cards';
  if (
    !isInit ||
    isLoading ||
    isValidating ||
    !canFetchRecommendations ||
    isWaitingForInterestsFetch
  ) {
    return 'skeleton';
  }

  return 'hidden';
};

export function useDailyBriefRecommendationsUI(
  options: UseDailyBriefRecommendationsUIOptions = {},
): DailyBriefRecommendationsUIState {
  const { count } = options;
  const recommendationCount = count ?? TASK_TEMPLATE_RECOMMEND_COUNT;
  const { i18n, t } = useTranslation('common');
  const locale = i18n.resolvedLanguage || i18n.language;

  const isLogin = useUserStore(authSelectors.isLogin);
  const useFetchBriefs = useBriefStore((s) => s.useFetchBriefs);
  useFetchBriefs(isLogin);

  const isInit = useBriefStore(briefListSelectors.isBriefsInit);

  const interestKeys = useResolvedInterestKeys();
  const [refreshSeed, setRefreshSeed] = useSessionStorageState<string>(REFRESH_SEED_STORAGE_KEY, {
    defaultValue: '',
  });

  const recommendationRequest = useMemo(
    () =>
      resolveDailyBriefRecommendationRequest({
        interestKeys,
        isLogin,
        locale,
        recommendationCount,
        refreshSeed,
      }),
    [interestKeys, isLogin, locale, recommendationCount, refreshSeed],
  );
  const { params, shouldFetch: canFetchRecommendations } = recommendationRequest;
  const key = params ? dailyRecommendKey(params) : undefined;
  const entry = useTaskTemplateRecommendationStore((s) =>
    key ? s.dailyRecommendMap[key] : undefined,
  );

  // The persisted row hydrates as soon as the user is known; the network read
  // waits for resolved interests (they are sent with the request).
  const { error, isHydrated, isValidating, revalidate } = dailyRecommendReplica.useSync(params, {
    revalidateIfStale: canFetchRecommendations,
    revalidateOnFocus: false,
    revalidateOnMount: canFetchRecommendations,
    revalidateOnReconnect: false,
  });
  const waitedForInterestsRef = useRef(false);

  useEffect(() => {
    if (!key) {
      waitedForInterestsRef.current = false;
      return;
    }

    if (interestKeys === null) {
      waitedForInterestsRef.current = true;
      return;
    }

    if (!waitedForInterestsRef.current) return;
    waitedForInterestsRef.current = false;
    void revalidate();
  }, [interestKeys, key, revalidate]);

  useEffect(() => {
    if (error) console.error('[taskTemplate:listDailyRecommend]', error);
  }, [error]);

  // A refresh mints a new seed (a new entry): keep the previous batch on screen
  // until the new one lands instead of dropping back to the skeleton.
  const previousRef = useRef<TaskTemplate[] | undefined>(undefined);
  if (entry) previousRef.current = entry;
  const shown = entry ?? (key && !error ? previousRef.current : undefined);

  const handleRefresh = useCallback(() => {
    setRefreshSeed(nextRefreshSeed());
  }, [setRefreshSeed]);

  const handleCreated = useCallback(
    (templateId: number) => {
      if (!key) return;
      dailyRecommendReplica.update(key, (current) =>
        current?.filter((tmpl) => tmpl.id !== templateId),
      );
    },
    [key],
  );

  const handleDismiss = useCallback(
    async (templateId: number) => {
      if (!key || !useTaskTemplateRecommendationStore.getState().dailyRecommendMap[key]) return;
      try {
        // Rolls the card back if the server refuses.
        await dailyRecommendReplica.optimistic(
          key,
          (current) => current.filter((tmpl) => tmpl.id !== templateId),
          () => taskTemplateService.dismiss(templateId),
        );
      } catch (error) {
        console.error('[taskTemplate:dismiss]', error);
        toast.error(t('taskTemplate.action.dismiss.error'));
      }
    },
    [key, t],
  );

  const templates = useMemo(() => normalizeTaskTemplateRecommendations(shown), [shown]);
  const requiredSources = useMemo(() => {
    const sources = new Set<TaskTemplateConnectorSource>();
    for (const tmpl of templates) {
      for (const connector of tmpl.connectors) sources.add(connector.source);
    }
    return sources;
  }, [templates]);
  const useFetchUserComposioConnections = useToolStore((s) => s.useFetchUserComposioConnections);
  const useFetchLobehubConnectorConnections = useToolStore(
    (s) => s.useFetchLobehubSkillConnections,
  );
  useFetchUserComposioConnections(requiredSources.has('composio'));
  useFetchLobehubConnectorConnections(requiredSources.has('lobehub'));

  const displayMode = resolveDailyBriefRecommendationDisplayMode({
    canFetchRecommendations,
    hasRecommendationKey: Boolean(key),
    hasTemplates: templates.length > 0,
    isInit,
    // Nothing settled for this entry yet: its persisted row is still being read.
    isLoading: !isHydrated,
    isValidating,
    isWaitingForInterestsFetch: interestKeys !== null && waitedForInterestsRef.current,
  });
  // A failed refresh keeps the cards it already has; a failed first load hides.
  if (error && templates.length === 0) return { mode: 'hidden' };
  if (displayMode === 'hidden') return { mode: 'hidden' };
  if (displayMode === 'skeleton') return { mode: 'skeleton', skeletonCount: recommendationCount };

  return {
    isValidating,
    mode: 'cards',
    onCreated: handleCreated,
    onDismiss: handleDismiss,
    onRefresh: handleRefresh,
    templates,
  };
}
