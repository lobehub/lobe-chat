import { type BuilderSuggestionItem, type BuilderSuggestionMode } from '@lobechat/prompts';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { useSingleton } from '@/hooks/useSingleton';
import { cacheScope } from '@/libs/replica';

import { useBuilderSuggestionFeedbackStore } from './feedbackStore';
import { builderSuggestionKey, type BuilderSuggestionParams } from './projection';
import { builderSuggestionReplica, useBuilderSuggestionStore } from './suggestionStore';

interface UseBuilderSuggestionsParams {
  /** Builtin builder agent id — drives the model and is recorded as `agentId`. */
  builderAgentId: string;
  contextSummary: string;
  enabled: boolean;
  locale?: string;
  mode: BuilderSuggestionMode;
  model: string;
  provider: string;
  /** Agent/group currently being edited. Config autosaves for the same target must not regenerate. */
  targetId?: string;
}

interface BuilderSuggestionsResult {
  error: unknown;
  isLoading: boolean;
  /** Discards the current batch (negative signal) and generates a fresh one. */
  refresh: () => void;
  suggestions: BuilderSuggestionItem[];
  tracingId?: string;
}

const EMPTY_SUGGESTIONS: BuilderSuggestionItem[] = [];

/** Failures land in `suggestionErrorMap` through the slice effects. */
const ignore = () => {};

export const useBuilderSuggestions = ({
  mode,
  builderAgentId,
  contextSummary,
  model,
  provider,
  locale,
  enabled,
  targetId,
}: UseBuilderSuggestionsParams): BuilderSuggestionsResult => {
  const markRegenerated = useBuilderSuggestionFeedbackStore((s) => s.markRegenerated);
  const scope = cacheScope.use();

  const params = useMemo<BuilderSuggestionParams | null>(
    () =>
      enabled && contextSummary && model && provider
        ? { builderAgentId, contextSummary, locale, mode, model, provider, targetId }
        : null,
    [builderAgentId, contextSummary, enabled, locale, mode, model, provider, targetId],
  );
  // The entry is keyed on target identity + locale only (see `builderSuggestionKey`):
  // config autosaves stream in new summaries for the same target and must not
  // regenerate. A generation reads the latest params through this ref.
  const key = params ? builderSuggestionKey(params) : undefined;
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const batch = useBuilderSuggestionStore((s) => (key ? s.suggestionMap[key] : undefined));
  const error = useBuilderSuggestionStore((s) => (key ? s.suggestionErrorMap[key] : undefined));

  // Before paint, so a scope switch never shows the previous identity's chips.
  useLayoutEffect(() => {
    if (key) builderSuggestionReplica.ensureScope(scope);
  }, [key, scope]);

  // Keep the batch on screen out of the LRU eviction.
  useEffect(() => (key ? builderSuggestionReplica.retain(key) : undefined), [key]);

  // Paint the persisted batch; generate (an LLM call) only when there is none —
  // once per scope + entry, so a failure is not retried on every render.
  const requested = useSingleton(() => new Set<string>());
  useEffect(() => {
    const current = paramsRef.current;
    if (!key || !current) return;
    let cancelled = false;
    void builderSuggestionReplica.hydrate(current, scope).then(() => {
      if (cancelled || useBuilderSuggestionStore.getState().suggestionMap[key]) return;
      const entry = `${scope}\u0000${key}`;
      if (requested.has(entry)) return;
      requested.add(entry);
      builderSuggestionReplica.fetch(paramsRef.current ?? current, { scope }).catch(ignore);
    });
    return () => {
      cancelled = true;
    };
  }, [key, scope]);

  const refresh = useCallback(() => {
    const current = paramsRef.current;
    if (!key || !current) return;
    markRegenerated(batch?.tracingId);
    // Clear the current batch (skeleton shows) and generate a fresh one from the
    // latest context; it replaces the persisted row once it lands.
    builderSuggestionReplica.update(key, () => undefined, { persist: false });
    builderSuggestionReplica.fetch(current, { fresh: true, scope }).catch(ignore);
  }, [batch?.tracingId, key, markRegenerated, scope]);

  return {
    error,
    // Nothing to paint yet: hydrating, or generating.
    isLoading: !!key && !batch && !error,
    refresh,
    suggestions: batch?.suggestions ?? EMPTY_SUGGESTIONS,
    tracingId: batch?.tracingId,
  };
};
