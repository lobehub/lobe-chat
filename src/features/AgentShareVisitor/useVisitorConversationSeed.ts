'use client';

import type { SharedAgentData } from '@lobechat/types';
import { useLayoutEffect, useState } from 'react';

import { useAgentStore } from '@/store/agent';
import { useChatStore } from '@/store/chat';

type SharedAgentIdentity = Pick<SharedAgentData, 'agentId' | 'agentMeta' | 'shareId'>;

const seedAgentMap = (agentId: string, agentMeta: SharedAgentIdentity['agentMeta']) => {
  // Visitors cannot call the owner-scoped agent-config API, so seed a minimal
  // `agentMap` entry from the share metadata by hand — mere presence is what
  // flips `isAgentConfigLoading*` off for the welcome header and chat input
  // skeletons. Merged via the store's dispatcher so nulls never clobber
  // existing fields.
  useAgentStore.getState().internal_dispatchAgentMap(agentId, {
    avatar: agentMeta.avatar ?? undefined,
    backgroundColor: agentMeta.backgroundColor ?? undefined,
    name: agentMeta.name ?? undefined,
    title: agentMeta.title ?? undefined,
  });
};

/**
 * Seeds the agent/chat stores for the visitor-facing share surface and reports
 * whether the URL selection has landed before mounting the conversation.
 *
 * Split into two effects with different dependencies on purpose:
 * - **selection effect** (`agentId`/`shareId`/`topicId`): initializes the
 *   chat-store selection from the URL, including browser history navigation.
 * - **metadata effect** (`agentMeta`): non-destructive agentMap re-seed so
 *   the header avatar/name/title stay fresh. An SWR revalidation hands back a
 *   brand-new `agentMeta` object even when the identity hasn't changed;
 *   folding this into the identity effect would wipe `activeTopicId` on every
 *   metadata refresh and yank the visitor into a new conversation mid-chat.
 */
export const useVisitorConversationSeed = (
  { agentId, agentMeta, shareId }: SharedAgentIdentity,
  topicId?: string,
): boolean => {
  const [seeded, setSeeded] = useState<{
    agentId: string;
    shareId: string;
    topicId?: string;
  }>();

  useLayoutEffect(() => {
    seedAgentMap(agentId, agentMeta);
    useAgentStore.setState({ activeAgentId: agentId }, false, 'AgentShareVisitor/seedSharedAgent');
    useChatStore.setState(
      {
        activeAgentId: agentId,
        activeGroupId: undefined,
        activeThreadId: undefined,
        activeTopicId: topicId,
      },
      false,
      'AgentShareVisitor/sync',
    );
    setSeeded({ agentId, shareId, topicId });
    // Metadata refreshes must not reset selection while a new topic is being created.
  }, [agentId, shareId, topicId]);

  useLayoutEffect(() => {
    seedAgentMap(agentId, agentMeta);
  }, [agentId, agentMeta]);

  return seeded?.agentId === agentId && seeded?.shareId === shareId && seeded?.topicId === topicId;
};
