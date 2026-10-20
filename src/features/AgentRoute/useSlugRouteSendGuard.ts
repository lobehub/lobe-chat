import { BUILTIN_AGENT_SLUGS } from '@lobechat/builtin-agents';
import { useMemo, useRef } from 'react';
import { useParams } from 'react-router';

import type { ConversationHooks } from '@/features/Conversation/types';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

import { looksLikeSlug } from './useResolvedAgentRouteId';

const builtinAgentSlugs = new Set<string>(Object.values(BUILTIN_AGENT_SLUGS));

/**
 * Whether a send on `/agent/<slug>` may go to the agent on screen.
 *
 * A user-chosen slug paints its agent from the persisted `slug → id` before the
 * lookup answers, and a slug can move to another agent between sessions. Until
 * the server confirms the slug, a send waits for that answer and goes through
 * only when it names the agent the conversation shows; otherwise the route is
 * about to switch agents and the draft stays in the composer.
 */
export const canSendOnSlugRoute = async (slug: string | undefined): Promise<boolean> => {
  if (!slug || builtinAgentSlugs.has(slug) || !looksLikeSlug(slug)) return true;

  const state = useAgentStore.getState();
  if (agentSelectors.isAgentSlugConfirmed(slug)(state)) return true;

  const shownAgentId = agentSelectors.getAgentIdBySlug(slug)(state);
  if (!shownAgentId) return false;

  try {
    return (await state.confirmAgentSlugTarget(slug)) === shownAgentId;
  } catch {
    return false;
  }
};

/** Conversation hooks that hold a send on an unconfirmed slug route (see `canSendOnSlugRoute`). */
export const useSlugRouteSendGuard = (): ConversationHooks => {
  const { aid } = useParams<{ aid?: string }>();
  const aidRef = useRef(aid);
  aidRef.current = aid;

  return useMemo(
    () => ({
      onBeforeSendMessage: async () =>
        (await canSendOnSlugRoute(aidRef.current)) ? undefined : false,
    }),
    [],
  );
};
