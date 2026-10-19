import { TRACING_SCENARIOS } from '@lobechat/const';
import {
  BUILDER_SUGGESTION_PROMPT_VERSION,
  BUILDER_SUGGESTION_SCHEMA_NAME,
  type BuilderSuggestionItem,
  chainBuilderSuggestion,
} from '@lobechat/prompts';
import { RequestTrigger } from '@lobechat/types';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import {
  createReplicaSlice,
  createReplicaState,
  recordLens,
  type ReplicaState,
} from '@/libs/replica';
import { aiChatService } from '@/services/aiChat';
import { createDevtools } from '@/store/middleware/createDevtools';

import {
  type BuilderSuggestionBatch,
  type BuilderSuggestionParams,
  builderSuggestionResource,
} from './projection';

type GenerateEnvelope = {
  data?: { suggestions?: BuilderSuggestionItem[] } | null;
  tracingId?: string;
} | null;

const generateBuilderSuggestions = async ({
  builderAgentId,
  contextSummary,
  locale,
  mode,
  model,
  provider,
}: BuilderSuggestionParams): Promise<BuilderSuggestionBatch> => {
  const { messages, schema } = chainBuilderSuggestion({ contextSummary, locale, mode });
  const envelope = (await aiChatService.generateJSON(
    {
      messages,
      metadata: { trigger: RequestTrigger.BuilderSuggestion },
      model,
      provider,
      schema,
      tracing: {
        agentId: builderAgentId,
        promptVersion: BUILDER_SUGGESTION_PROMPT_VERSION,
        scenario: TRACING_SCENARIOS.BuilderSuggestion,
        schemaName: BUILDER_SUGGESTION_SCHEMA_NAME,
      },
    },
    new AbortController(),
  )) as GenerateEnvelope;

  const suggestions = (envelope?.data?.suggestions ?? [])
    .filter((s) => s?.title?.trim() && s?.prompt?.trim())
    .slice(0, 3)
    .map(({ prompt, title }) => ({ prompt, title }));

  return { suggestions, tracingId: envelope?.tracingId };
};

export interface BuilderSuggestionStoreState {
  /** `builderSuggestionKey(params)` → the last generation failure, cleared by a success. */
  suggestionErrorMap: Record<string, unknown>;
  /** `builderSuggestionKey(params)` → the last generated batch. */
  suggestionMap: Record<string, BuilderSuggestionBatch>;
  suggestionReplica: ReplicaState<BuilderSuggestionBatch>;
}

export const initialBuilderSuggestionState: BuilderSuggestionStoreState = {
  suggestionErrorMap: {},
  suggestionMap: {},
  suggestionReplica: createReplicaState(),
};

const devtools = createDevtools('builderSuggestion');

const setError = (key: string, error: unknown) => {
  const { suggestionErrorMap } = useBuilderSuggestionStore.getState();
  if (suggestionErrorMap[key] === error) return;
  const next = { ...suggestionErrorMap };
  if (error === undefined) delete next[key];
  else next[key] = error;
  useBuilderSuggestionStore.setState({ suggestionErrorMap: next });
};

export const useBuilderSuggestionStore = createWithEqualityFn<BuilderSuggestionStoreState>()(
  devtools(() => initialBuilderSuggestionState),
  shallow,
);

/**
 * Generation is an LLM call, so it never runs as a mount-time sync: views
 * hydrate the persisted batch first and `fetch` only an entry that is still
 * empty (see `useBuilderSuggestions`).
 */
export const builderSuggestionReplica = createReplicaSlice(builderSuggestionResource, {
  actionPrefix: 'builderSuggestion',
  effects: {
    onApplied: (_data, _params, { key }) => setError(key, undefined),
    onError: (error, _params, { isActive, key }) => {
      if (isActive && key) setError(key, error);
    },
  },
  fetcher: generateBuilderSuggestions,
  get: useBuilderSuggestionStore.getState,
  set: useBuilderSuggestionStore.setState,
  stateKey: 'suggestionReplica',
  view: recordLens<BuilderSuggestionStoreState, BuilderSuggestionBatch>('suggestionMap'),
});
