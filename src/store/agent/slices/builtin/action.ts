import { SWRResponse } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { useOnlyFetchOnceSWR } from '@/libs/swr';
import { agentService } from '@/services/agent';

import type { AgentStore } from '../../store';

interface UseInitBuiltinAgentContext {
  /**
   * Whether the user is logged in.
   * When false or undefined, the hook will not fetch the agent.
   */
  isLogin?: boolean;
}

/**
 * Builtin Agent Slice Actions
 * Handles initialization and management of builtin agents (page-agent, inbox, etc.)
 */
export interface BuiltinAgentSliceAction {
  /**
   * Generic hook to initialize a builtin agent by slug.
   * Fetches the builtin agent (creating it if it doesn't exist)
   * and stores its ID in builtinAgentIdMap.
   *
   * @param slug - The builtin agent slug (e.g., 'page-agent', 'inbox')
   * @param context - Optional context with isLogin flag
   */
  useInitBuiltinAgent: (
    slug: string,
    context?: UseInitBuiltinAgentContext,
  ) => SWRResponse<{ id: string } | null>;
}

export const createBuiltinAgentSlice: StateCreator<
  AgentStore,
  [['zustand/devtools', never]],
  [],
  BuiltinAgentSliceAction
> = (set, get) => ({
  useInitBuiltinAgent: (slug, context) =>
    useOnlyFetchOnceSWR<{ id: string } | null>(
      !context?.isLogin ? null : `initBuiltinAgent:${slug}`,
      () => agentService.getBuiltinAgent(slug),
      {
        onSuccess: (data) => {
          if (data?.id) {
            set(
              { builtinAgentIdMap: { ...get().builtinAgentIdMap, [slug]: data.id } },
              false,
              `useInitBuiltinAgent/${slug}`,
            );
          }
        },
      },
    ),
});
